import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/smugmug-api-reference-app/',
    component: ComponentCreator('/smugmug-api-reference-app/', '663'),
    routes: [
      {
        path: '/smugmug-api-reference-app/',
        component: ComponentCreator('/smugmug-api-reference-app/', '3c6'),
        routes: [
          {
            path: '/smugmug-api-reference-app/',
            component: ComponentCreator('/smugmug-api-reference-app/', 'c5b'),
            routes: [
              {
                path: '/smugmug-api-reference-app/agent-native/action-registry',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/action-registry', '3ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/agent-native/implementation-guide',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/implementation-guide', '36d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/agent-native/interactive-examples',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/interactive-examples', 'c20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/agent-native/natural-language-api',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/natural-language-api', '97a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/agent-native/overview',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/overview', 'c60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/agent-native/structured-data',
                component: ComponentCreator('/smugmug-api-reference-app/agent-native/structured-data', '582'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/ai-development/multi-agent-workflow',
                component: ComponentCreator('/smugmug-api-reference-app/ai-development/multi-agent-workflow', 'dc9'),
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
                component: ComponentCreator('/smugmug-api-reference-app/getting-started/quick-start', '8ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/smugmug-api-reference-app/implementation/ai-integration',
                component: ComponentCreator('/smugmug-api-reference-app/implementation/ai-integration', 'a37'),
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
                component: ComponentCreator('/smugmug-api-reference-app/implementation/service-layer', 'd0b'),
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
