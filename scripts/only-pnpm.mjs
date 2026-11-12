// Se ejecuta en "preinstall": impide instalar dependencias con npm o yarn.
const agent = process.env.npm_config_user_agent ?? '';

if (!agent.startsWith('pnpm/')) {
  console.error('\nEste proyecto usa pnpm. Instala las dependencias con: pnpm install\n');
  process.exit(1);
}
