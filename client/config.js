const configData = {
  appVersion: "1.0",
  appDeveloper: "ErnieJohnson.ca",

  textColor: 'white', // TODO - implement & tie to css variable
  backgroundTheme: 'husky',
  backgroundStyle: 'landscape', // TODO - implement this feature
  showIconLabels: true, // TODO - implement this feature (label under the app bar icons)
  showClock: true, // TODO - implement this feature
  showTasks: false, // TODO - implement this feature
  showNotes: false, // TODO - implement this feature
  showSearch: true, // TODO - implement this feature
  appBarSticky: true, // TODO - implement this -- true is app bar always open, otherwise slide open when mouse is 50px(?) within left edge
  clockType: 12, // or 12 for 12h format
  imageTimer: 5,  // changes every x minutes
  widgetTransparency: 0.5, // TODO - global for the transparency level of all widgets / see CSS vars for now
  showTimeandDate: true,  // TODO - not yet implemented - date & time always on
  vignetteLevel: 0, // TODO - this should adjust the opacity of our vignette mask / see CSS vars for now
}