# 🚀 Guia de Deploy para GitHub Pages

## Método 1: GitHub Pages Simples (Mais Fácil)

1. **Crie um repositório no GitHub**
   - Vá para https://github.com/new
   - Nome: `Pong-GA` (ou qualquer nome)
   - Público ou Privado
   - Não inicialize com README

2. **Faça upload dos arquivos**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/Pong-GA.git
   git push -u origin main
   ```

3. **Ative o GitHub Pages**
   - Vá em **Settings** do repositório
   - Role até **Pages** no menu lateral
   - Em **Source**, selecione `main` branch
   - Clique em **Save**
   - Aguarde alguns minutos

4. **Acesse seu site**
   - URL será: `https://SEU-USUARIO.github.io/Pong-GA/`

## Método 2: Usando GitHub Actions (Automático)

O arquivo `.github/workflows/pages.yml` já está configurado!

1. Siga os passos 1 e 2 do Método 1
2. O GitHub Actions fará o deploy automaticamente
3. Vá em **Settings** > **Pages** e selecione **GitHub Actions** como source

## 📋 Checklist Antes do Deploy

- [ ] Todos os arquivos estão commitados
- [ ] O arquivo `index.html` está na raiz do repositório
- [ ] O README.md está presente
- [ ] Testou localmente abrindo o `index.html` no navegador

## 🔧 Solução de Problemas

### Site não carrega
- Verifique se o branch está correto (geralmente `main`)
- Aguarde alguns minutos após ativar o Pages
- Verifique se há erros no console do navegador (F12)

### Erros no código
- Abra o console do navegador (F12) para ver erros
- Verifique se todos os arquivos foram commitados
- Teste localmente primeiro

### GitHub Actions falha
- Verifique se o arquivo `.github/workflows/pages.yml` está correto
- Veja os logs em **Actions** no GitHub

## 📝 Notas

- O GitHub Pages é gratuito para repositórios públicos
- Para repositórios privados, você precisa do GitHub Pro
- O site será atualizado automaticamente a cada push

---

**Pronto! Seu projeto estará online em alguns minutos! 🎉**

