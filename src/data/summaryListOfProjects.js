let listOfProjects = [
  {
    project_id: 'e24ecf6a-f162-4a81-832f-1bc6a6938162',
    name: 'project 1',
    description: 'analyze this',
    project_meta: {
      version: '0.3.5',
      meta: {
        project_id: 'e24ecf6a-f162-4a81-832f-1bc6a6938162',
        status: 'EMPTY',
      },
    },
    permission: 'owner',
  },
  {
    project_id: '0a7a3e75-d392-45d3-8ad5-9f8cd08b309e',
    name: 'project 2',
    description: null,
    project_meta: {
      version: '0.3.5',
      meta: {
        project_id: '0a7a3e75-d392-45d3-8ad5-9f8cd08b309e',
        status: 'EMPTY',
      },
    },
    permission: 'read',
  },
  {
    project_id: 'b2baeb45-a0a5-4fb8-ae48-c35b89e8b93f',
    name: 'project 3',
    description: 'great project',
    project_meta: {
      version: '0.3.5',
      meta: {
        project_id: 'b2baeb45-a0a5-4fb8-ae48-c35b89e8b93f',
        status: 'EMPTY',
      },
    },
    permission: 'rw',
  },
  {
    project_id: 'a5e64ded-8cb6-41af-95a6-58a0ec6ce0cc',
    name: 'from postman',
    description: 'go',
    project_meta: {
      version: '0.3.5',
      meta: {
        projectId: 'a5e64ded-8cb6-41af-95a6-58a0ec6ce0cc',
        status: 'EMPTY',
      },
    },
    permission: 'rw',
  },
  {
    project_id: '1a2e9d71-0fbf-4540-96e1-7a99d14e42cb',
    name: 'project-share',
    description: 'Will share this project with another user',
    project_meta: null,
    permission: 'owner',
  },
  {
    project_id: '314ff3f6-aca3-470b-88ec-6648c8e53126',
    name: 'project-share',
    description: 'Will share this project with another user',
    project_meta: null,
    permission: 'owner',
  },
]

export const getSummaryList = () => listOfProjects
export const deleteItem = (deleteItem) =>
  (listOfProjects = listOfProjects.filter(
    ({ project_id }) => project_id !== deleteItem,
  ))
