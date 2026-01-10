import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Configuración de Rewrites (El Puente Vercel -> Google Cloud Functions)
  async rewrites() {
    return [
      {
        source: "/api/authInstagram",
        destination: "https://authinstagram-vgnfjmsega-uc.a.run.app",
      },
      {
        source: "/api/getPages",
        destination: "https://getpages-vgnfjmsega-uc.a.run.app",
      },
      {
        source: "/api/connectPage",
        destination: "https://connectpage-vgnfjmsega-uc.a.run.app",
      },
      {
        source: "/api/disconnectInstagram",
        destination: "https://disconnectinstagram-vgnfjmsega-uc.a.run.app",
      },
      {
        source: "/api/sendManualMessage",
        destination: "https://sendmanualmessage-vgnfjmsega-uc.a.run.app",
      },
      {
        source: "/api/updateConversationStage",
        destination: "https://updateconversationstage-vgnfjmsega-uc.a.run.app",
      },
    ];
  },
};

export default nextConfig;
