import { Observable, of } from 'rxjs';
import { RedmineIssue } from 'src/app/redmine-model/redmine-issue.interface';
import { RedmineProject } from 'src/app/redmine-model/redmine-project.interface';

export class RedmineServiceMock {
  static mockRedmineProjects: RedmineProject[] = [
    {
      id: 5,
      name: 'Arbeit',
      identifier: 'arbeit',
      description: 'hat auch hier mit arbeit zu tun',
      status: 1,
      parent: undefined,
      created_on: '2017-06-15T10:35:25Z',
      updated_on: '2017-06-15T10:35:25Z'
    },
    {
      id: 10,
      name: 'Büro',
      identifier: 'buero',
      description: 'zum arbeiten',
      parent: {
        id: 5,
        name: 'Arbeit'
      },
      status: 1,
      created_on: '2017-06-16T08:44:46Z',
      updated_on: '2018-11-21T15:05:39Z'
    },
    {
      id: 11,
      name: 'Schrank',
      identifier: 'schrank',
      description: 'Schränke sind gut',
      parent: {
        id: 10,
        name: 'Büro'
      },
      status: 1,
      created_on: '2017-06-16T12:51:00Z',
      updated_on: '2018-11-21T15:06:16Z'
    },
    {
      id: 12,
      name: 'Schublade',
      identifier: 'schublade',
      description: 'Ist nur zum ablegen',
      parent: {
        id: 11,
        name: 'Schrank'
      },
      status: 1,
      created_on: '2017-06-22T14:10:37Z',
      updated_on: '2017-06-22T14:10:37Z'
    },
    {
      id: 9,
      name: 'Küche',
      identifier: 'kueche',
      description: 'zum Kochen',
      parent: {
        id: 5,
        name: 'Arbeit'
      },
      status: 1,
      created_on: '2017-06-16T08:44:26Z',
      updated_on: '2017-06-16T08:44:26Z'
    },
    {
      id: 8,
      name: 'Pausenraum',
      identifier: 'pausenraum',
      description: 'Jupp',
      parent: {
        id: 5,
        name: 'Arbeit'
      },
      status: 1,
      created_on: '2017-06-16T08:44:07Z',
      updated_on: '2017-06-16T08:44:07Z'
    },
    {
      id: 13,
      name: 'Neues Oberprojekt',
      identifier: 'neues-oberprojekt',
      description: 'für gewaltige sachen',
      status: 1,
      parent: undefined,
      created_on: '2017-06-22T14:11:04Z',
      updated_on: '2017-06-22T14:11:04Z'
    },
    {
      id: 1,
      name: 'Redmine App',
      identifier: 'redmine-app',
      description: 'Eine App für den Zugriff auf die Redmine API',
      status: 1,
      parent: undefined,
      created_on: '2016-05-27T19:14:33Z',
      updated_on: '2016-05-27T19:14:33Z'
    },
    {
      id: 4,
      name: 'Schule',
      identifier: 'schule',
      description: 'Alles, was damit zu tun hat',
      status: 1,
      parent: undefined,
      created_on: '2017-06-15T10:34:42Z',
      updated_on: '2017-06-15T10:34:42Z'
    },
    {
      id: 6,
      name: 'Klasse',
      identifier: 'klasse',
      description: 'ist ein Unterprojekt',
      parent: {
        id: 4,
        name: 'Schule'
      },
      status: 1,
      created_on: '2017-06-15T11:36:08Z',
      updated_on: '2017-06-15T11:36:08Z'
    },
    {
      id: 7,
      name: 'Meister',
      identifier: 'meister',
      description: 'ist der Hausmeister',
      parent: {
        id: 4,
        name: 'Schule'
      },
      status: 1,
      created_on: '2017-06-15T11:36:32Z',
      updated_on: '2017-06-15T11:36:32Z'
    },
    {
      id: 3,
      name: 'Testneu',
      identifier: 'testneu',
      description: '',
      status: 1,
      parent: undefined,
      created_on: '2017-06-15T09:56:43Z',
      updated_on: '2017-06-15T09:56:43Z'
    },
    {
      id: 2,
      name: 'Testprojekt',
      identifier: 'testprojekt',
      description: 'Content',
      status: 1,
      parent: undefined,
      created_on: '2017-06-14T13:02:33Z',
      updated_on: '2017-06-14T13:02:33Z'
    },
    {
      id: 14,
      name: 'Das bekommt noch ein unterprojekt',
      identifier: 'das-bekommt-noch-ein-unterprojekt',
      description: '',
      parent: {
        id: 2,
        name: 'Testprojekt'
      },
      status: 1,
      created_on: '2017-06-22T14:11:26Z',
      updated_on: '2017-06-22T14:11:26Z'
    }
  ];

  static mockRedmineIssues: RedmineIssue[] = [
    {
      id: 65,
      project: {
        id: 8,
        name: 'Pausenraum'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'rauchen nur draussen',
      description: 'es stinkt!',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:58:27Z',
      updated_on: '2017-07-03T06:58:27Z'
    },
    {
      id: 64,
      project: {
        id: 11,
        name: 'Schrank'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'boden locker',
      description: 'müssen ein paar schrauben rein',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:57:01Z',
      updated_on: '2017-07-03T06:57:01Z'
    },
    {
      id: 63,
      project: {
        id: 11,
        name: 'Schrank'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Flügeltüren',
      description: 'fehlen noch am ganzen object!',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:55:53Z',
      updated_on: '2017-07-03T06:55:53Z'
    },
    {
      id: 62,
      project: {
        id: 10,
        name: 'Büro'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'schreibtisch',
      description: 'muss gewechselt werden',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:51:38Z',
      updated_on: '2017-07-03T06:51:38Z'
    },
    {
      id: 61,
      project: {
        id: 6,
        name: 'Klasse'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'neue schrift',
      description: 'wird nun einzug halten',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:50:52Z',
      updated_on: '2017-07-03T06:50:52Z'
    },
    {
      id: 60,
      project: {
        id: 5,
        name: 'Arbeit'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'auch ein neues',
      description: 'zum testen wiedermal',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:48:16Z',
      updated_on: '2017-07-03T06:48:16Z'
    },
    {
      id: 59,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'neu',
      description: 'tester',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-07-03T06:45:29Z',
      updated_on: '2017-07-03T06:46:53Z'
    },
    {
      id: 58,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: ' neu',
      description: 'neu',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-23T10:51:56Z',
      updated_on: '2017-06-23T10:51:56Z'
    },
    {
      id: 57,
      project: {
        id: 11,
        name: 'Schrank'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Neues Ticket in Schrank',
      description: 'Voll was los hier',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-23T10:35:10Z',
      updated_on: '2017-06-23T10:35:10Z'
    },
    {
      id: 55,
      project: {
        id: 12,
        name: 'Schublade'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Unterste Schublade',
      description: 'Neuer Text im Project 55!',
      start_date: '2017-06-23',
      done_ratio: 0,
      created_on: '2017-06-23T06:59:43Z',
      updated_on: '2017-06-23T07:22:19Z'
    },
    {
      id: 54,
      project: {
        id: 11,
        name: 'Schrank'
      },
      tracker: {
        id: 4,
        name: 'Feedback'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'wird jetzt auch hier abgelegt?',
      description: 'mal sehen :)',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-16T12:52:38Z',
      updated_on: '2017-06-16T12:52:38Z'
    },
    {
      id: 53,
      project: {
        id: 11,
        name: 'Schrank'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Schubfach ist am start',
      description: 'denn da kann man drin speichern',
      start_date: '2017-06-16',
      done_ratio: 0,
      created_on: '2017-06-16T12:51:24Z',
      updated_on: '2017-06-16T12:51:24Z'
    },
    {
      id: 52,
      project: {
        id: 9,
        name: 'Küche'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'ist für das Kochen da',
      description: 'und das ist für die Mitarbeiter',
      start_date: '2017-06-16',
      done_ratio: 0,
      created_on: '2017-06-16T12:50:23Z',
      updated_on: '2017-06-23T07:23:25Z'
    },
    {
      id: 51,
      project: {
        id: 7,
        name: 'Meister'
      },
      tracker: {
        id: 4,
        name: 'Feedback'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Legen wir hier halt noch eins an',
      description: 'der langeweile wegen',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-16T12:42:33Z',
      updated_on: '2017-06-22T14:20:16Z'
    },
    {
      id: 50,
      project: {
        id: 6,
        name: 'Klasse'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Vorhandenes Neu erstellen',
      description: 'Das erste mal und so',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-16T12:37:55Z',
      updated_on: '2017-06-23T07:47:52Z'
    },
    {
      id: 49,
      project: {
        id: 8,
        name: 'Pausenraum'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'japp',
      description: 'hatter jemacht',
      start_date: '2017-06-16',
      done_ratio: 0,
      created_on: '2017-06-16T12:22:59Z',
      updated_on: '2017-06-23T07:24:00Z'
    },
    {
      id: 48,
      project: {
        id: 6,
        name: 'Klasse'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'nur ein test',
      description: 'mit allem dran und drin',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T14:31:59Z',
      updated_on: '2017-06-15T14:31:59Z'
    },
    {
      id: 47,
      project: {
        id: 7,
        name: 'Meister'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Unterprojektticket Meister',
      description: 'und dessen aufgaben',
      start_date: '2017-06-15',
      done_ratio: 0,
      created_on: '2017-06-15T11:38:38Z',
      updated_on: '2017-06-23T07:46:36Z'
    },
    {
      id: 46,
      project: {
        id: 6,
        name: 'Klasse'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Unterprojekt der Klasse',
      description: 'mit beschreibung',
      start_date: '2017-06-15',
      done_ratio: 0,
      created_on: '2017-06-15T11:38:12Z',
      updated_on: '2017-06-15T11:38:12Z'
    },
    {
      id: 45,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'pla',
      description: 'pla',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T11:25:09Z',
      updated_on: '2017-06-23T08:36:29Z'
    },
    {
      id: 44,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: '2',
      description: '3',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T11:18:08Z',
      updated_on: '2017-06-15T11:18:08Z'
    },
    {
      id: 43,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'hihi',
      description: 'krasser shice',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T11:13:42Z',
      updated_on: '2017-06-15T11:13:42Z'
    },
    {
      id: 42,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 3,
        name: 'Support'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'genau',
      description: 'weils so ist',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:57:58Z',
      updated_on: '2017-06-15T10:57:58Z'
    },
    {
      id: 41,
      project: {
        id: 5,
        name: 'Arbeit'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'neu',
      description: 'was auch immer',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:49:12Z',
      updated_on: '2017-06-15T10:49:12Z'
    },
    {
      id: 40,
      project: {
        id: 5,
        name: 'Arbeit'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'muss ich da wirklich arbeiten??',
      description: 'glaube ja',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:39:54Z',
      updated_on: '2017-06-15T10:39:54Z'
    },
    {
      id: 39,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 5,
        name: 'Administration'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Bin ich hier in der Schule?',
      description: 'mal schauen ;)',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:39:12Z',
      updated_on: '2017-06-15T10:39:12Z'
    },
    {
      id: 38,
      project: {
        id: 4,
        name: 'Schule'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Schulticket',
      description: 'braucht jedermann',
      start_date: '2017-06-15',
      done_ratio: 0,
      created_on: '2017-06-15T10:36:39Z',
      updated_on: '2017-06-15T10:36:39Z'
    },
    {
      id: 37,
      project: {
        id: 5,
        name: 'Arbeit'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Ticket Arbeit',
      description: 'Weils so ist!',
      start_date: '2017-06-15',
      done_ratio: 0,
      created_on: '2017-06-15T10:36:20Z',
      updated_on: '2017-06-15T10:36:20Z'
    },
    {
      id: 36,
      project: {
        id: 3,
        name: 'Testneu'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Thema im bereich arbeit',
      description: 'mit dem zeug dazu',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:33:44Z',
      updated_on: '2017-06-15T10:33:44Z'
    },
    {
      id: 35,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Thema Projekt Schule',
      description: 'Beschreibung in dem Projekt',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:33:14Z',
      updated_on: '2017-06-15T10:33:14Z'
    },
    {
      id: 34,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 3,
        name: 'Support'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Testnummer 1',
      description: 'Ok',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:18:05Z',
      updated_on: '2017-06-15T10:18:05Z'
    },
    {
      id: 33,
      project: {
        id: 3,
        name: 'Testneu'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'TEst',
      description: 'neu',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T10:16:41Z',
      updated_on: '2017-06-15T10:16:41Z'
    },
    {
      id: 32,
      project: {
        id: 3,
        name: 'Testneu'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Das ist das Ticket des neuen Projekts',
      description: 'Und genau hier steht die Beschreibung',
      start_date: '2017-06-15',
      done_ratio: 0,
      created_on: '2017-06-15T09:58:37Z',
      updated_on: '2017-06-15T09:58:37Z'
    },
    {
      id: 31,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 4,
        name: 'Feedback'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Das ist ein Test',
      description: 'Testen wir doch mal die neue Beschreibung des Tickets',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T08:55:44Z',
      updated_on: '2017-06-15T09:04:38Z'
    },
    {
      id: 30,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'de',
      description: 'de',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T07:29:14Z',
      updated_on: '2017-06-15T07:29:14Z'
    },
    {
      id: 24,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      'assigned_to': {
        id: 10,
        name: 'Thomas Anders'
      },
      subject: 'Problem mit der Hinterachse',
      description: 'zu breit um sie zu fahren',
      start_date: undefined,
      done_ratio: 0,
      created_on: '2017-06-15T06:48:54Z',
      updated_on: '2017-06-15T07:06:58Z'
    },
    {
      id: 5,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 1,
        name: 'Bug'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Mit allem was geht',
      description: 'Lautet es lang und deutlich',
      start_date: undefined,
      done_ratio: 60,
      created_on: '2017-06-14T13:36:56Z',
      updated_on: '2017-06-14T13:43:17Z'
    },
    {
      id: 4,
      project: {
        id: 2,
        name: 'Testprojekt'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 9,
        name: 'Admin Develappers'
      },
      subject: 'Testticket',
      description: 'mit Inhalt',
      start_date: '2017-06-14',
      done_ratio: 0,
      created_on: '2017-06-14T13:03:01Z',
      updated_on: '2017-06-14T13:03:01Z'
    },
    {
      id: 3,
      project: {
        id: 1,
        name: 'Redmine App'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 5,
        name: 'Test Nutzer'
      },
      subject: 'Nutzer-Rechte',
      description: 'Funktionen von Redmine können abhängig der Rechte des Nutzers verfügbar sein. Dem Nutzer muss, für die implementierten Funktionen, ersichtlich sein, ob er eine Aktion durchführen kann bevor der API-Zugriff erfolgt.',
      start_date: '2016-07-02',
      done_ratio: 0,
      created_on: '2016-07-02T20:07:30Z',
      updated_on: '2016-07-02T20:07:30Z'
    },
    {
      id: 2,
      project: {
        id: 1,
        name: 'Redmine App'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 5,
        name: 'Test Nutzer'
      },
      subject: 'Login',
      description: 'Dem Nutzer soll es möglich sein, sich, mittels der URL zum Redmine und dem API-Key, in der Anwendung anzumelden.',
      start_date: '2016-07-02',
      done_ratio: 0,
      created_on: '2016-07-02T19:59:18Z',
      updated_on: '2016-07-02T19:59:18Z'
    },
    {
      id: 1,
      project: {
        id: 1,
        name: 'Redmine App'
      },
      tracker: {
        id: 2,
        name: 'Feature'
      },
      status: {
        id: 3,
        name: 'Neu'
      },
      priority: {
        id: 2,
        name: 'Normal'
      },
      author: {
        id: 5,
        name: 'Test Nutzer'
      },
      subject: 'Benutzer-Rollen',
      description: 'Dem Nutzer soll es möglich sein, sich seine eigene Nutzerrolle anzuzeigen',
      start_date: '2016-07-02',
      done_ratio: 0,
      created_on: '2016-07-02T19:57:49Z',
      updated_on: '2016-07-02T19:57:49Z'
    }
  ];

  getProjects(): Observable<RedmineProject[]> {
    return of(RedmineServiceMock.mockRedmineProjects);
  }

  getIssues(): Observable<RedmineIssue[]> {
    return of(RedmineServiceMock.mockRedmineIssues);
  }
}
