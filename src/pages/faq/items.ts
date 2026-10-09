export type FaqPart =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }

type Lang = 'uz' | 'kiril' | 'ru'

export type FaqItem = {
  id: number
  q: Record<Lang, FaqPart[]>
  a: Record<Lang, FaqPart[]>
}

const text = (value: string): FaqPart => ({ kind: 'text', text: value })
const link = (label: string, href: string): FaqPart => ({ kind: 'link', text: label, href })

const TG198 = 'https://t.me/eavtotalimuz/198'
const TG109 = 'https://t.me/eavtotalimuz/109'
const MYGOV = 'https://my.gov.uz/oz'
const TEL = 'tel:+998900994477'
const PHONE = '+998900994477'

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    q: {
      uz: [text('Yangi guruhlarni "Kamera davomati" bo‘limiga qanday va qachon kiritiladi?')],
      kiril: [text('Янги гуруҳларни "Камера давомати" бўлимига қандай ва қачон киритилади?')],
      ru: [text('Как и когда можно добавлять новые группы в раздел "Посещаемость камер"?')],
    },
    a: {
      uz: [
        text(
          'Guruhingiz Eavtotalim.uz da "Faol" bo‘limiga o‘tganidan keyin "Kamera davomati" bo‘limiga qo‘shish tugmachasi orqali kiritiladi va o‘quvchilarni Face ID tanishni boshlaydi. Face ID ga o‘quvchilarni kiritish haqida ',
        ),
        link('@eavtotalimuz', TG198),
        text(' kanalida ko‘rsatilgan.'),
      ],
      kiril: [
        text(
          'Гуруҳингиз Eavtotalim.uz да "Фаол" бўлимига ўтганидан кейин "Камера давомати" бўлимига қўшиш тугмачаси орқали киритилади ва ўқувчиларни Face ID танишни бошлайди. Face ID га ўқувчиларни киритиш ҳақида ',
        ),
        link('@eavtotalimuz', TG198),
        text(' каналида кўрсатилган.'),
      ],
      ru: [
        text(
          'Когда ваша новая группа перейдет в статус "активный", вы можете добавить свою группу в раздел "Посещаемость камер" с помощью кнопки "Добавить", и после этого Face ID начнет распознавать лица учеников. Подробнее: ',
        ),
        link('@eavtotalimuz', TG198),
        text('.'),
      ],
    },
  },
  {
    id: 2,
    q: {
      uz: [text('"COMFORT" tarifiga shartnomani qanday olsak bo‘ladi, kimga murojaat qilish kerak?')],
      kiril: [text('Комфорт тарифига шартномани қандай олсак бўлади, кимга мурожаат қилиш керак?')],
      ru: [text('Как получить договор на тариф "COMFORT", и к кому обратиться?')],
    },
    a: {
      uz: [text('+998900994477 raqamga bog‘laning.')],
      kiril: [text('+998900994477 рақамга боғланинг.')],
      ru: [text('Позвоните в этот номер +998900994477')],
    },
  },
  {
    id: 3,
    q: {
      uz: [text('Bahoni o‘tib ketgan (orqa) sana bilan qo‘ysa bo‘ladimi?')],
      kiril: [text('Баҳони ўтиб кетган (орқа) сана билан қўйса бўладими?')],
      ru: [text('Можно ли поставить оценку по прошедшей дате?')],
    },
    a: {
      uz: [
        text('Bahoni o‘tib ketgan (orqa) sana bilan qo‘ysa bo‘ladi. '),
        link('@eavtotalimuz', TG198),
        text(' qo‘llanmalar kanalida bu bo‘yicha savollarga javoblar keltirilgan.'),
      ],
      kiril: [
        text('Баҳони ўтиб кетган (орқа) сана билан қўйса бўлади. '),
        link('@eavtotalimuz', TG198),
        text(' қўлланмалар каналида бу бўйича саволларга жавоблар келтирилган.'),
      ],
      ru: [
        text('Оценка может быть выставлена по прошедшим датам. Ответы на вопросы по системе предоставлены в специальном канале '),
        link('@eavtotalimuz', TG198),
        text('.'),
      ],
    },
  },
  {
    id: 4,
    q: {
      uz: [text("Face ID kamerasidan o'quvchilar o'tganidan keyin qachon elektron jurnalda belgilanadi?")],
      kiril: [text('Face ID камерасидан ўқувчилар ўтганидан кейин қачон электрон журналда белгиланади?')],
      ru: [text('Когда отмечается посещаемость учеников в электронном журнале после того, как ученики прошли через Face ID?')],
    },
    a: {
      uz: [text("Face ID dan o'tganlaridan keyin ertasi kuni guruhingiz davomatini elektron jurnaldan ko'rsangiz bo'ladi.")],
      kiril: [text('Face ID дан ўтганларидан кейин эртаси куни гуруҳингиз давоматини электрон журналдан кўрсангиз бўлади.')],
      ru: [text('Вы можете увидеть посещаемость вашей группы в электронном журнале на следующий день после прохождения учеников через Face ID.')],
    },
  },
  {
    id: 5,
    q: {
      uz: [
        link('My.gov.uz', MYGOV),
        text(" (Yagona darcha) dan yuborilgan guruhim dars kunlari va soatini xato belgilagan ekanmiz. Shuni to'g'irlashni iloji bormi?"),
      ],
      kiril: [
        link('My.gov.uz', MYGOV),
        text(' (Ягона дарча) дан юборилган гуруҳим дарс кунлари ва соатини хато белгилаган эканмиз. Шуни тўғирлашни иложи борми?'),
      ],
      ru: [
        text('Моя группа, отправленная с '),
        link('My.gov.uz', MYGOV),
        text(' («Единое окно»), ошибочно поставили не те дни и часы занятий. Есть ли способ это исправить?'),
      ],
    },
    a: {
      uz: [
        link('My.gov.uz', MYGOV),
        text(" (Yagona darcha) dan yuborilgan guruhlarni dars kunlarini yoki vaqtini o'zgartirishni iloji yo'q."),
      ],
      kiril: [
        link('My.gov.uz', MYGOV),
        text(' (Ягона дарча) дан юборилган гуруҳларни дарс кунларини ёки вақтини ўзгартиришни иложи йўқ.'),
      ],
      ru: [
        text('Невозможно изменить дни занятий или время групп, отправленных с '),
        link('My.gov.uz', MYGOV),
        text(' (Единое окно).'),
      ],
    },
  },
  {
    id: 6,
    q: {
      uz: [text("Faol guruhni ta'lim narxini o'zgartirsa bo'ladimi?")],
      kiril: [text('Фаол гуруҳни таълим нархини ўзгартирса бўладими?')],
      ru: [text('Можно ли изменить стоимость обучения активной группы?')],
    },
    a: {
      uz: [text("O'zgartirsa bo'ladi, "), link(PHONE, TEL), text(' raqamga aloqaga chiqing.')],
      kiril: [text('Ўзгартирса бўлади, '), link(PHONE, TEL), text(' рақамга алоқага чиқинг.')],
      ru: [text('Вы можете изменить его, обратившись по телефону '), link(PHONE, TEL), text('.')],
    },
  },
  {
    id: 7,
    q: {
      uz: [text("O'quvchilarni login, parollarini qayerdan olaman va ularni qay tarzda beraman? Qayerdan kiriladi? Alohida kabineti bormi?")],
      kiril: [text('Ўқувчиларни логин, паролларини қаердан оламан ва уларни қай тарзда бераман? Қаердан кирилади? Алоҳида кабинети борми?')],
      ru: [text('Где взять логины и пароли наших учеников и как их передать? Куда заходить? Есть ли отдельный профиль?')],
    },
    a: {
      uz: [link('@eavtotalimuz', TG109), text(" qo'llanma kanaliga kirib barcha savollaringizga javob topishingiz mumkin.")],
      kiril: [link('@eavtotalimuz', TG109), text(' қўлланма каналига кириб барча саволларингизга жавоб топишингиз мумкин.')],
      ru: [text('Ответы на все ваши вопросы вы можете найти, зайдя на специальный канал '), link('@eavtotalimuz', TG109), text('.')],
    },
  },
  {
    id: 8,
    q: {
      uz: [text("Avtodrom shartnomasini kiritib qo'ydik qachon tasdiqlanadi?")],
      kiril: [text('Автодром шартномасини киритиб қўйдик қачон тасдиқланади?')],
      ru: [text('Мы включили контракт на автодром, когда это будет подтверждено?')],
    },
    a: {
      uz: [text("Bir ish kunida tasdiqlanadi, agar tasdiqlanmagan bo'lsa "), link(PHONE, TEL), text(' shu raqamga aloqaga chiqing.')],
      kiril: [text('Бир иш кунида тасдиқланади, агар тасдиқланмаган бўлса '), link(PHONE, TEL), text(' шу рақамга алоқага чиқинг.')],
      ru: [text('Подтверждается в течение одного рабочего дня, если не подтверждено, свяжитесь с нами по этому номеру '), link(PHONE, TEL), text('.')],
    },
  },
  {
    id: 9,
    q: {
      uz: [text("Guruh ro'yxatdan o'tganidan keyin necha kun ichida tasdiqlanadi va qaytariladi (otkaz bo'ladi)?")],
      kiril: [text('Гуруҳ рўйхатдан ўтганидан кейин неча кун ичида тасдиқланади ва қайтарилади (отказ бўлади)?')],
      ru: [text('Через сколько дней после отправления для регистрации группа будет одобрена или возвращена (отказана)?')],
    },
    a: {
      uz: [text('2-3 ish kunida sizga javobi keladi.')],
      kiril: [text('2-3 иш кунида сизга жавоби келади.')],
      ru: [text('В течение 2-3 рабочих дней вы получите ответ.')],
    },
  },
  {
    id: 10,
    q: {
      uz: [text("Guruhni ro'yxatdan o'tkazish qayerdan amalga oshiriladi? Eavtotalim.uz dan emasmi?")],
      kiril: [text('Гуруҳни рўйхатдан ўтказиш қаердан амалга оширилади? Eavtotalim.uz дан эмасми?')],
      ru: [text('Откуда производится регистрация группы? Не с сайта Eavtotalim.uz?')],
    },
    a: {
      uz: [text('Yangi guruhlar Eavtotalim.uz dan emas, '), link('My.gov.uz', MYGOV), text(" platformasidan (Yagona darchadan) ro'yxatdan o'tkaziladi.")],
      kiril: [text('Янги гуруҳлар Eavtotalim.uz дан эмас, '), link('My.gov.uz', MYGOV), text(' платформасидан (Ягона дарчадан) рўйхатдан ўтказилади.')],
      ru: [text('Новые группы регистрируются не с Eavtotalim.uz, а с платформы '), link('My.gov.uz', MYGOV), text(' («Единое окно»).')],
    },
  },
  {
    id: 11,
    q: {
      uz: [
        link('My.gov.uz', MYGOV),
        text(" dan qaytarilgan guruhlarni rad etilish bo'yicha sababini to'g'irlab jo'natsak qabul bo'ladimi?"),
      ],
      kiril: [
        link('My.gov.uz', MYGOV),
        text(' дан қайтарилган гуруҳларни рад этилиш бўйича сабабини тўғирлаб жўнатсак қабул бўладими?'),
      ],
      ru: [
        text('Подтвердится ли наша группа, если мы отправим отказанные группы с '),
        link('My.gov.uz', MYGOV),
        text(' после исправления причины отклонения?'),
      ],
    },
    a: {
      uz: [text("Ha, agar boshqa xatoliklar bo'lmasa guruhingiz tasdiqlanadi.")],
      kiril: [text('Ҳа, агар бошқа хатоликлар бўлмаса гуруҳингиз тасдиқланади.')],
      ru: [text('Да, ваша группа будет подтверждена, если не будет других ошибок.')],
    },
  },
  {
    id: 12,
    q: {
      uz: [text("Bir o'qituvchimiz bizga yangi keldi, Eavtotalim.uz tizimga qo'shaman desam boshqa maktabda faol deb ko'rsatdi, qanday u maktabdan o'chirsak bo'ladi?")],
      kiril: [text('Бир ўқитувчимиз бизга янги келди, Eavtotalim.uz тизимга қўшаман десам бошқа мактабда фаол деб кўрсатди, қандай у мактабдан ўчирсак бўлади?')],
      ru: [text('Один из наших учителей у нас новый. Когда я пытаюсь добавить его в систему Eavtotalim.uz, он показывает, что он активен в другой школе. Как мы можем удалить его из бывшей школы?')],
    },
    a: {
      uz: [
        text("Eski maktabidan o'chirishni iloji yo'q. Ishdan bo'shagan maktablari faol emas qilib qo'yishlari kerak. Agar bunday qilolmasa "),
        link(PHONE, TEL),
        text(' raqamga aloqaga chiqishlari kerak.'),
      ],
      kiril: [
        text('Эски мактабидан ўчиришни иложи йўқ. Ишдан бўшаган мактаблари фаол эмас қилиб қўйишлари керак. Агар бундай қилолмаса '),
        link(PHONE, TEL),
        text(' рақамга алоқага чиқишлари керак.'),
      ],
      ru: [
        text('Его невозможно удалить от старой школы. Другой школе следует изменить статус учителя на "бездействующий". Если они не могут этого сделать, им следует позвонить по телефону '),
        link(PHONE, TEL),
        text('.'),
      ],
    },
  },
]
