const configData = {
  appVersion: "1.0.0",
  appDeveloper: "ErnieJohnson.ca",
  runningDebug: true,
  newVersion: "0.0.0", // set this to the next version available if one exists

  textColor: 'white', // TODO - implement & tie to css variable
  backgroundTheme: 'husky',
  backgroundStyle: 'landscape', // TODO - implement this feature
  showIconLabels: true, // TODO - implement this feature (label under the app bar icons)
  showClock: true, // TODO - implement this feature
  showTasks: false, // TODO - implement this feature
  showNotes: false, // TODO - implement this feature
  showSearch: true, // TODO - implement this feature
  showTopten: true, // TODO - implement this feature (top 10 exists, just conditionally render)
  appBarSticky: true, // TODO - implement this -- true is app bar always open, otherwise slide open when mouse is 50px(?) within left edge
  clockType: 12, // or 12 for 12h format
  imageTimer: 5,  // changes every x minutes
  widgetTransparency: 0.5, // TODO - global for the transparency level of all widgets / see CSS vars for now
  showTimeandDate: true,  // TODO - not yet implemented - date & time always on
  vignetteLevel: 0, // TODO - this should adjust the opacity of our vignette mask / see CSS vars for now

  newTabs: false,  // true is any bookmarks and searches open in new tab, otherwise this tab // TODO - implement htis


  gitLink: '',
  calendarLink: '',  // TODO - if blank show basic calendar, otherwise 'none' for no calendar, or URL to google etc.
  dropboxLink: '',
  amazonLink: '',
  googledriveLink: '',
};
