import * as React from "react"

export const Index = {
  "button-demo": {
    name: "button-demo",
    description: "",
    type: "registry:example",
    registryDependencies: ["button"],
    files: [
      {
        path: "src/examples/button-demo.tsx",
        type: "registry:example",
        target: "",
      },
    ],
    component: React.lazy(() => import("src/examples/button-demo")),
    source: "",
    category: "",
    subcategory: "",
    chunks: [],
  },
} as const
