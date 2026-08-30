const terms = {
  systolic: 'Szisztolés',
  diastolic: 'Diasztolés',
  pulse: 'Pulzus',
};

export const i18n = {
  appTitle: 'Vérnyomás',

  actions: {
    refresh: 'Frissítés',
    newReading: 'Új mérés',
    save: 'Mentés',
    cancel: 'Mégse',
    delete: 'Törlés',
    today: 'Ma',
  },

  loading: 'Betöltés...',
  noData: 'Nincs adat',
  noReadings: 'Nincsenek mérések',

  chart: {
    systolic: terms.systolic,
    systolicShort: 'Sys',
    diastolic: terms.diastolic,
    diastolicShort: 'Dia',
    pulse: terms.pulse,
    pulseShort: 'Pul',
  },

  stats: {
    avgSystolic: `Átl. ${terms.systolic.toLowerCase()}`,
    avgSystolicShort: 'Átl. sys',
    avgDiastolic: `Átl. ${terms.diastolic.toLowerCase()}`,
    avgDiastolicShort: 'Átl. dia',
    avgPulse: `Átl. ${terms.pulse.toLowerCase()}`,
    avgPulseShort: 'Átl. pul',
    range: 'Tartomány',
    rangeShort: 'Tart.',
  },

  table: {
    date: 'Dátum',
    systolic: terms.systolic,
    diastolic: terms.diastolic,
    pulse: terms.pulse,
    notes: 'Megjegyzések',
  },

  dialog: {
    editTitle: 'Mérés szerkesztése',
    systolic: terms.systolic,
    diastolic: terms.diastolic,
    pulse: terms.pulse,
    datetime: 'Dátum és idő',
    notes: 'Megjegyzések (opcionális)',
    notesPlaceholder: 'Bármilyen megjegyzés...',
  },

  confirm: {
    deleteTitle: 'Mérés törlése',
    deleteMessage: 'Biztos vagy, hogy szeretnéd törölni ezt a mérést?',
  },

  login: {
    subtitle: 'Bejelentkezés szükséges',
    googleButton: 'Bejelentkezés Google-lel',
  },
};
