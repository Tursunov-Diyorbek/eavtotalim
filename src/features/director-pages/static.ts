export const VIDEO_GUIDE_CARDS = [
  { id: 1, titleKey: 'nav.sectionEducation', count: 5, enabled: true },
  { id: 2, titleKey: 'nav.sectionExam', count: 0, enabled: false },
  { id: 3, titleKey: 'nav.paymentHistory', count: 1, enabled: true },
  { id: 4, titleKey: 'nav.sectionPrint', count: 0, enabled: false },
  { id: 5, titleKey: 'nav.sectionUsers', count: 0, enabled: false },
  { id: 6, titleKey: 'nav.sectionSettings', count: 0, enabled: false },
] as const

export const FAQ_ITEMS = [
  {
    id: 1,
    q: {
      uz: 'Yangi guruhlarni "Kamera davomati" bo‘limiga qanday va qachon kiritiladi?',
      kiril: 'Янги гуруҳларни «Камера давомати» бўлимига қандай ва қачон киритилади?',
      ru: 'Как и когда можно добавлять новые группы в раздел «Посещаемость камер»?',
    },
    a: {
      uz: 'Guruhingiz Eavtotalim.uz da «Faol» bo‘limiga o‘tganidan keyin «Kamera davomati» orqali kiritiladi. Face ID haqida: https://t.me/eavtotalimuz/198',
      kiril: 'Гуруҳингиз «Фаол» бўлимига ўтганидан кейин «Камера давомати» орқали киритилади. Face ID: https://t.me/eavtotalimuz/198',
      ru: 'После перехода группы в статус «активный» добавьте её в «Посещаемость камер». Face ID: https://t.me/eavtotalimuz/198',
    },
  },
  {
    id: 2,
    q: {
      uz: '«COMFORT» tarifiga shartnomani qanday olsak bo‘ladi?',
      kiril: '«COMFORT» тарифига шартномани қандай олсак бўлади?',
      ru: 'Как получить договор на тариф «COMFORT»?',
    },
    a: {
      uz: '+998900994477 raqamga bog‘laning.',
      kiril: '+998900994477 рақамга боғланинг.',
      ru: 'Позвоните по номеру +998900994477',
    },
  },
  {
    id: 3,
    q: {
      uz: 'Bahoni o‘tib ketgan (orqa) sana bilan qo‘ysa bo‘ladimi?',
      kiril: 'Баҳони ўтиб кетган (орқа) сана билан қўйса бўладими?',
      ru: 'Можно ли поставить оценку по прошедшей дате?',
    },
    a: {
      uz: 'Ha, qo‘ysa bo‘ladi. Qo‘llanma: https://t.me/eavtotalimuz/198',
      kiril: 'Ҳа, қўйса бўлади. Қўлланма: https://t.me/eavtotalimuz/198',
      ru: 'Да. Подробнее: https://t.me/eavtotalimuz/198',
    },
  },
  {
    id: 4,
    q: {
      uz: 'Face ID kamerasidan o‘quvchilar o‘tganidan keyin qachon jurnalda belgilanadi?',
      kiril: 'Face ID камерасидан ўқувчилар ўтганидан кейин қачон журналда белгиланади?',
      ru: 'Когда посещаемость отмечается в журнале после Face ID?',
    },
    a: {
      uz: 'Ertasi kuni elektron jurnaldan ko‘rish mumkin.',
      kiril: 'Эртаси куни электрон журналдан кўриш мумкин.',
      ru: 'На следующий день в электронном журнале.',
    },
  },
  {
    id: 5,
    q: {
      uz: 'My.gov.uz orqali yuborilgan guruh dars kuni/soatini to‘g‘rilash mumkinmi?',
      kiril: 'My.gov.uz орқали юборилган гуруҳ дарс куни/соатини тўғрилаш мумкинми?',
      ru: 'Можно ли исправить дни и часы группы, отправленной с My.gov.uz?',
    },
    a: {
      uz: 'My.gov.uz dan yuborilgan guruhlarda dars kuni yoki vaqtini o‘zgartirib bo‘lmaydi.',
      kiril: 'My.gov.uz дан юборилган гуруҳларда дарс куни ёки вақтини ўзгартириб бўлмайди.',
      ru: 'Дни и время групп с My.gov.uz изменить нельзя.',
    },
  },
] as const
