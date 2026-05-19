# Ingoo Tutoriais

Página estática multilíngue (PT / EN / ES / ZH) com tutoriais em vídeo para os comerciantes Ingoo.

## Estrutura

- `public/` — site estático (index.html + assets + videos + subtitles)
- `Dockerfile` + `nginx.conf` — container para deploy (Coolify, Hetzner)
- `compress.sh` — comprime vídeos originais com ffmpeg (H.264 720p)
- `extract_audio.sh` — extrai trilhas de áudio para Whisper
- `transcribe.sh` — gera legendas em PT-BR via OpenAI Whisper

## Dev local

```bash
cd public && python3 -m http.server 8080
```

## Deploy

Coolify aponta para este repo, build com Dockerfile, exposed port `80`.
Domínio: `tutoriais.superappingoo.com.br`.
