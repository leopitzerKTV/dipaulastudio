INSERT INTO public.story_chapters (position, date_label, title, body)
SELECT v.position, v.date_label, v.title, v.body
FROM (VALUES
  (0, '2019', 'O primeiro olhar', 'Foi numa tarde de outono, em uma cafeteria pequena, que tudo começou. Um sorriso bastou.'),
  (1, 'Maio · 2023', 'O pedido', 'Diante do mar, ao pôr do sol, com o anel na mão e o coração tremendo: ''casa comigo?'''),
  (2, 'Maio · 2025', 'O nosso sim', 'Diante de quem amamos, sob arcos de rosas brancas, prometemos uma vida inteira.'),
  (3, 'Maio · 2025', 'A celebração', 'Sparklers no céu, risadas até o amanhecer e a certeza de que isso ficaria para sempre.'),
  (4, 'Junho · 2025', 'Lua de mel', 'Mãos dadas em um cais de madeira, com o mar turquesa lembrando: agora é só o começo.')
) AS v(position, date_label, title, body)
WHERE NOT EXISTS (SELECT 1 FROM public.story_chapters);

INSERT INTO public.timeline_milestones (position, date_label, title)
SELECT v.position, v.date_label, v.title
FROM (VALUES
  (0, '12 · Mai · 2023', 'Pedido de Casamento'),
  (1, '24 · Mai · 2025', 'Nosso Casamento'),
  (2, '24 · Mai · 2025', 'A Festa'),
  (3, '27 · Mai · 2025', 'Lua de Mel')
) AS v(position, date_label, title)
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_milestones);