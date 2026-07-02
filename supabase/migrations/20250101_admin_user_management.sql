-- Função para listar todos os usuários administrativos
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email,
    ur.created_at
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC;
END;
$$;

RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  existing_role TEXT;
BEGIN
  -- Buscar o user_id pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = _email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Verificar se já tem papel admin
  SELECT role INTO existing_role
  FROM user_roles
  WHERE user_id = target_user_id AND role = 'admin';
  
  IF existing_role IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário já é administrador');
  END IF;
  
  -- Inserir papel admin
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (target_user_id, 'admin', NOW());
  
  RETURN jsonb_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Função para remover papel admin de um usuário
CREATE OR REPLACE FUNCTION remove_admin_role(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  admin_count INTEGER;
BEGIN
  -- Buscar email do usuário
  SELECT au.email INTO user_email
  FROM auth.users au
  WHERE au.id = _user_id;
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Verificar se é super admin
  IF user_email = 'kriativagrupo@gmail.com' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não é possível remover super admin');
  END IF;
  
  -- Contar administradores restantes (excluindo o usuário atual)
  SELECT COUNT(*) INTO admin_count
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role = 'admin' 
    AND ur.user_id != _user_id
    AND au.email <> 'kriativagrupo@gmail.com';
  
  -- Se não houver outros admins além do super admin, impedir
  IF admin_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não é possível remover o último administrador');
  END IF;
  
  -- Remover papel admin
  DELETE FROM user_roles
  WHERE user_id = _user_id AND role = 'admin';
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION list_admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION remove_admin_role TO authenticated;
