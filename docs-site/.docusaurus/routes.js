import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/smugmug-api-reference-app/',
    component: ComponentCreator('/smugmug-api-reference-app/', 'acd'),
    routes: [
      {
        path: '/smugmug-api-reference-app/',
        component: ComponentCreator('/smugmug-api-reference-app/', '090'),
        routes: [
          {
            path: '/smugmug-api-reference-app/',
            component: ComponentCreator('/smugmug-api-reference-app/', 'c10'),
            routes: [
              {
                path: '/smugmug-api-reference-app/ai-development/multi-agent-workflow',
                component: ComponentCreator('/smugmug-api-reference-app/ai-development/multi-agent-workflow', '3d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/getting-started/installation',
                component: ComponentCreator('/smugmug-api-reference-app/getting-started/installation', 'ac8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/getting-started/quick-start',
                component: ComponentCreator('/smugmug-api-reference-app/getting-started/quick-start', 'bd6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/ai-integration',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/ai-integration', '281'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/react-patterns',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/react-patterns', '418'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/service-layer',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/service-layer', 'aaf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/',
                component: ComponentCreator('/smugmug-api-reference-app/', 'e42'),
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
