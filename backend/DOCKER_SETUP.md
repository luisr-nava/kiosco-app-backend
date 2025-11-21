# 🐳 Configuración de Docker para Kiosco App Backend

## Estado Actual del Proyecto

✅ **Backend restaurado y funcionando correctamente**
✅ **Docker configurado y levantado**
✅ **Prisma 6 (compatible con sistema actual)**
✅ **Todos los errores resueltos**

---

## 🚀 Comandos Docker

### Levantar el backend en Docker
```bash
docker-compose up -d --build
```

### Ver logs
```bash
docker-compose logs -f kiosco-service
```

### Detener servicios
```bash
docker-compose down
```

### Reconstruir y levantar
```bash
docker-compose up -d --build
```

---

## 📁 Archivos de Configuración

### `.env` (Desarrollo Local)
Configuración para ejecutar el backend directamente con `npm run start:dev`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kiosco"
AUTH_SERVICE_URL=http://localhost:3001/api/v1
NODE_ENV=development
```

### `.env.docker` (Producción en Docker)
Configuración utilizada por `docker-compose.yml`:
```env
DATABASE_URL="postgresql://postgres:postgres@kiosco-db:5432/kiosco?schema=public"
AUTH_SERVICE_URL=http://auth_service:3000/api/v1
NODE_ENV=production
```

---

## 🌐 Endpoints Disponibles

Una vez levantado, el backend estará disponible en:

- **API Base**: `http://localhost:3002/api`
- **Swagger Docs**: `http://localhost:3002/api`
- **Base de Datos**: `localhost:5433` (puerto externo)

---

## 🗄️ Base de Datos

### Conexión desde host (fuera de Docker)
```
Host: localhost
Port: 5433
User: postgres
Password: postgres
Database: kiosco
```

### Conexión entre contenedores
```
Host: kiosco-db
Port: 5432
```

---

## 🔧 Desarrollo Local (sin Docker)

Si quieres ejecutar el backend localmente sin Docker:

1. **Asegúrate de tener PostgreSQL corriendo localmente en puerto 5432**

2. **Usa el archivo `.env` (ya configurado)**

3. **Genera el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

4. **Ejecuta las migraciones:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicia el servidor:**
   ```bash
   npm run start:dev
   ```

---

## 📦 Prisma

### Generar cliente de Prisma
```bash
npx prisma generate
```

### Ver base de datos con Prisma Studio
```bash
npx prisma studio
```

### Crear migración (solo en desarrollo local)
```bash
npx prisma migrate dev --name nombre_de_migracion
```

---

## ⚠️ Notas Importantes

1. **Archivos NO editables**: No modifiques los archivos `.prisma` en `prisma/schemas/` a menos que necesites cambios en el schema.

2. **Prisma 6 vs 7**: Actualmente usa **Prisma 6** para compatibilidad. NO actualices a Prisma 7 a menos que migres todo el sistema.

3. **Variables de entorno**:
   - Docker usa `.env.docker`
   - Desarrollo local usa `.env`
   - NO commitees archivos `.env` con credenciales reales

4. **Migraciones**: Las migraciones existentes están en `prisma/migrations/`. No las elimines.

---

## 🐛 Troubleshooting

### El contenedor no inicia
```bash
docker-compose logs kiosco-service
```

### Base de datos no conecta
Verifica que el contenedor `kiosco-db` esté healthy:
```bash
docker-compose ps
```

### Prisma Client desactualizado
```bash
npx prisma generate
npm run build
docker-compose up -d --build
```

### Puerto ya en uso
Si el puerto 3002 o 5433 están ocupados, edita `docker-compose.yml`:
```yaml
ports:
  - '3003:3000'  # Cambiar 3002 por 3003
```

---

## 📋 Estado del Sistema

**Última actualización**: 21/11/2024

- ✅ Backend compilando sin errores
- ✅ Docker funcionando correctamente
- ✅ Base de datos PostgreSQL 16.1
- ✅ Prisma 6.19.0
- ✅ NestJS 11.0.1
- ✅ Node 20-alpine

---

## 🎯 Para Producción

Antes de subir a producción:

1. **Cambia el JWT_SECRET** en `.env.docker` por uno seguro (64+ caracteres aleatorios)
2. **Actualiza ALLOWED_ORIGINS** con los dominios de producción
3. **Usa variables de entorno del servidor** en lugar de archivos `.env`
4. **Configura SSL/TLS** en la base de datos
5. **Revisa los logs** de seguridad antes de desplegar

---

## 💡 Comandos Útiles

```bash
# Ver todos los contenedores
docker ps -a

# Ver uso de recursos
docker stats

# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Acceder al contenedor del backend
docker exec -it kiosco-service sh

# Acceder a PostgreSQL
docker exec -it kiosco-db psql -U postgres -d kiosco
```
