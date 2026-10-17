# Migração Delux (code archive → Lovable)

## Pedido atual
- [ ] Retirar confirmação de e-mail sem alterar outras proteções. Bloqueio: leitura hospedada não expõe password_hibp_enabled; desativar confirmação em Mais → Usuários → Configurações de autenticação → E-mail.
- [x] Usar a imagem enviada como assistente e reagir a cada resposta.
- [x] Personagem novo (corpo retangular + bracinho separado, igual à última foto): corpo parado e só o bracinho acenando a cada resposta. Camadas corpo/bracinho no CDN, rotação no ponto do ombro (77.5% 98%). Teste com login não feito (usuário recusou a aprovação de sessão); build OK e assets 200.

- [x] Inspecionar arquivo ZIP (Express + JSON DB + Gemini + React Router)
- [x] Ativar Lovable Cloud + auth por e-mail
- [ ] Migration: profiles, preferences, goals, diagnostics, steps, missions, activity_events, conversations, messages, notifications, subscriptions
- [ ] Server functions replicando os endpoints do server.ts
- [ ] IA do assistente via Lovable AI Gateway (gemini-3.8-flash)
- [ ] Shim react-router-dom → TanStack Router
- [ ] Reescrever api.ts sobre server functions
- [ ] Reescrever AuthContext sobre Lovable Cloud auth
- [ ] Rotas: login, cadastro, recuperar-senha, onboarding, assinatura, app/*
- [ ] Estilos globais (scrollbar, animações) no styles.css
- [ ] Metadados head() das rotas
- [ ] Verificar build + fluxo ponta a ponta (cadastro → onboarding → meta → missão → assistente)
