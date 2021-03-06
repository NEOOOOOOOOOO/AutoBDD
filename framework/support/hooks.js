const frameworkPath = process.env.FrameworkPath;
const framework_libs = require(frameworkPath + '/framework/libs/framework_libs');
const screen_session = require(frameworkPath + '/framework/libs/screen_session');

const frameworkHooks = {
  BeforeFeature: function(feature, callback) {
    // start RDP and sshfs
    if (process.env.SSHHOST && process.env.SSHPORT) {
      // these start functions will prevent double running
      framework_libs.startSshFs();
      if (process.env.MOVIE == 1 || process.env.SCREENSHOT == 1) {
        framework_libs.startRdesktop();
        var targetDesktopImage;
        switch (process.env.PLATFORM) {
          case 'Win10':
            targetDesktopImage = frameworkPath + '/framework/support/images/windows10_startButton.png';
            break;
          case 'Win7':
            targetDesktopImage = frameworkPath + '/framework/support/images/windows10_startButton.png';
            break;
        }
        try {
          var imageSimilarity = process.env.imageSimilarity;
          var imageWaitTime = 10;
          screen_session.screenWaitImage(targetDesktopImage, imageSimilarity, imageWaitTime);
          console.log('can see desktop');
        } catch(e) {
          console.log('cannot see desktop');
        }
        // browser.pause(5000);
      }
    }
    callback();
  },

  BeforeScenario: function(scenario, callback) {
    var scenarioName = scenario.getName();
    browser.windowHandleMaximize();
    // increase IE browser script execution time
    if (process.env.BROWSER == 'IE') browser.timeouts('script', 60000);
    if (process.env.MOVIE == 1) framework_libs.startRecording(scenarioName);
    callback();
  },

  BeforeStep: function(step, callback) {
    var stepName = step.getName();
    callback();
  },

  AfterStep: function(step, callback) {
    var stepName = step.getName();
    callback();
  },

  // this AfterScenario has scenario info but without result. Use After below if you need result
  AfterScenario: function(scenario, callback) {
    var scenarioName = scenario.getName();

    if (process.env.MOVIE == 1) {
      framework_libs.takeScreenshot(scenarioName);
      framework_libs.stopRecording(scenarioName);
    } else if (process.env.SCREENSHOT == 1) {
      framework_libs.takeScreenshot(scenarioName);
    }
    
    var image_tag, video_tag;
    if (scenario.isSuccessful()) {
      framework_libs.renamePassedFailed(scenarioName, 'Passed');
      [image_tag, video_tag] = framework_libs.getHtmlReportTags(scenarioName, 'Passed');
    } else {
      framework_libs.renamePassedFailed(scenarioName, 'Failed');
      [image_tag, video_tag] = framework_libs.getHtmlReportTags(scenarioName, 'Failed');
    }

    if (process.env.MOVIE == 1) {
      scenario.attach(video_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 1) {
      scenario.attach(image_tag, 'text/html');
    }
    
    // need to perform these steps before tear down RDP
    screen_session.keyTap('0', 'control');
    browser.pause(1000);
    callback();
  },

  AfterFeature: function(feature, callback) {
    if (process.env.SSHHOST && process.env.SSHPORT) {
      try {
        if (process.env.MOVIE == 1 || process.env.SCREENSHOT == 1) framework_libs.stopRdesktop();
        framework_libs.stopSshFs();
        framework_libs.stopSshTunnel();
      } catch(e) {}
    }
    callback();
  }
}

module.exports = frameworkHooks;
