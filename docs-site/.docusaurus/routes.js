import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/smugmug-api-reference-app/',
    component: ComponentCreator('/smugmug-api-reference-app/', 'aec'),
    routes: [
      {
        path: '/smugmug-api-reference-app/',
        component: ComponentCreator('/smugmug-api-reference-app/', 'cba'),
        routes: [
          {
            path: '/smugmug-api-reference-app/',
            component: ComponentCreator('/smugmug-api-reference-app/', '35b'),
            routes: [
              {
                path: '/smugmug-api-reference-app/ai-development/multi-agent-workflow',
                component: ComponentCreator('/smugmug-api-reference-app/ai-development/multi-agent-workflow', '1b8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/getting-started/installation',
                component: ComponentCreator('/smugmug-api-reference-app/getting-started/installation', 'c7e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/getting-started/quick-start',
                component: ComponentCreator('/smugmug-api-reference-app/getting-started/quick-start', '317'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/ai-integration',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/ai-integration', '40e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/react-patterns',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/react-patterns', 'b6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/service-layer',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/service-layer', '7b8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/',
                component: ComponentCreator('/smugmug-api-reference-app/', '70e'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
