let configData = {
  appVersion: "1.0.0",
  appDeveloper: "ErnieJohnson.ca",
  appName: "YourTab!",
  runningDebug: true,
  newVersion: "0.0.0", // set this to the next version available if one exists

  textColor: 'white', // TODO - implement & tie to css variable
 
  backgroundStyle: 'landscape', // TODO - implement this feature
  showIconLabels: true, // TODO - implement this feature (label under the app bar icons)
  showClock: true, // TODO - implement this feature
  showTasks: false, // TODO - implement this feature
  showNotes: false, // TODO - implement this feature
  showSearch: true, // TODO - implement this feature
  appBarSticky: true, // TODO - implement this -- true is app bar always open, otherwise slide open when mouse is 50px(?) within left edge

  widgetTransparency: 0.5, // TODO - global for the transparency level of all widgets / see CSS vars for now
  showTimeandDate: true,  // TODO - not yet implemented - date & time always on
  vignetteLevel: 0, // TODO - this should adjust the opacity of our vignette mask / see CSS vars for now
  newTabs: false,  // true is any bookmarks and searches open in new tab, otherwise this tab // TODO - implement htis


  showWeather: true, // TODO - implement this feature

  // TODO items that are done:
  showTopten: true, 
  backgroundTheme: 'dogs',
  imageTimer: 15,  // changes every x minutes
  clockType: null, // null for 12h format, "on" for 24h format
  gitLink: '',
  calendarLink: '',
  dropboxLink: 'yes',
  amazonLink: 'yes',
  googledriveLink: '',
};
