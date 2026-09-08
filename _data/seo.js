import site from "./site.json" with { type: "json" };

const home = `${site.url}/`;
const organization = `${home}#organization`;
export default {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organization,
      name: site.name,
      url: home,
      logo: `${site.url}/assets/img/logo.png`,
      description: site.description,
    },
    {
      "@type": "WebSite",
      "@id": `${home}#website`,
      name: site.name,
      url: home,
      publisher: { "@id": organization },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${home}#webpage`,
      name: site.seoTitle,
      url: home,
      description: site.description,
      isPartOf: { "@id": `${home}#website` },
      about: { "@id": organization },
      inLanguage: "en-US",
    },
    ...[
      [
        "platform",
        "Private Kubernetes infrastructure",
        "Assessment, design, implementation, documentation, training, and paid platform care on client-owned hardware.",
      ],
      [
        "gpu",
        "GPU platform enablement",
        "Compatible GPU hardware planning, scheduling, workload isolation, and monitoring.",
      ],
      [
        "ai",
        "Private AI workflow enablement",
        "Private model and workflow deployment, access controls, storage integration, and operational runbooks.",
      ],
      [
        "migration",
        "Legacy VM migration assessment and implementation",
        "KubeVirt compatibility assessment and separately scoped, phased migration of compatible virtual machines into Kubernetes.",
      ],
    ].map(([id, name, description]) => ({
      "@type": "Service",
      "@id": `${home}#service-${id}`,
      name,
      description,
      provider: { "@id": organization },
      url: `${home}${id === "platform" ? "#services" : "#options"}`,
    })),
  ],
};
