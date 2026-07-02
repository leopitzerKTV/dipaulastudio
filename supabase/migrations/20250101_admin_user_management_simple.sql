-- Execute este SQL no SQL Editor do Supabase

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

-- Função para verificar se um email é super admin
CREATE OR REPLACE FUNCTION is_super_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN _email = 'kriativagrupo@gmail.com';
END;
$$;

-- Função para adicionar papel admin a um usuário por email
CREATE OR REPLACE FUNCTION add_admin_role(_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  existing_role TEXT;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = _email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  SELECT role INTO existing_role
  FROM user_roles
  WHERE user_id = target_user_id AND role = 'admin';
  
  IF existing_role IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário já é administrador');
  END IF;
  
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
  SELECT au.email INTO user_email
  FROM auth.users au
  WHERE au.id = _user_id;
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  IF is_super_admin(user_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não é possível remover super admin');
  END IF;
  
  SELECT COUNT(*) INTO admin_count
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role = 'admin' 
    AND ur.user_id != _user_id
    AND NOT is_super_admin(au.email);
  
  IF admin_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não é possível remover o último administrador');
  END IF;
  
  DELETE FROM user_roles
  WHERE user_id = _user_id AND role = 'admin';
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION list_admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION remove_admin_role TO authenticated;
