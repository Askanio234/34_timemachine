var TIMEOUT_IN_SECS = 3 * 60
var SECOND_TIMEOUT_IN_SECS = 30
var TEMPLATE = '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'
var STYLES = `height: auto; position: fixed; top: 15px; left: 25px; \
z-index: 99; border: solid black 1px; color: #5787af; \
background-color: #e0f6ff; border-radius: 30%; \
padding: 0 10px; margin: 10px 10px;`

var QUOTES = [
  `Success is no accident. It is hard work, perseverance, learning, \
studying, sacrifice and most of all, love of what you are doing or learning to do.`,
  `A dream doesn't become reality through magic; \
it takes sweat, determination and hard work.`,
  `Work like you don't need the money. \
Love like you've never been hurt. \
Dance like nobody's watching.`,
  `Success isn't always about greatness. \
It's about consistency. Consistent hard work leads to success. \
Greatness will come.`
]

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs){
    this.initial_timeout_in_secs = timeout_in_secs
    this.reset()
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds/1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  reset(timeout_in_secs){
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    this.timerContainer.setAttribute("style", STYLES)
    this.timerContainer.innerHTML = TEMPLATE

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS)
  var timerWiget = new TimerWidget()
  var intervalId = null
  var stopClockEvent = new Event("stopclock")
  var isStopClockFired = false
  var second_timer = null
  var secondIntervalId = null

  timerWiget.mount(document.body)

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    timerWiget.update(secsLeft)
    if (secsLeft === 0 && !isStopClockFired) {
      document.dispatchEvent(stopClockEvent)
      isStopClockFired = true
    }
  }

  function handleSecondIntervalTick() {
    if(second_timer){
      var secsLeftSecondTimer = second_timer.calculateSecsLeft()
      if (secsLeftSecondTimer === 0) {
        var randomQuote = QUOTES[Math.floor(Math.random()*QUOTES.length)]
        window.alert(randomQuote)
        second_timer.reset()
        second_timer.start()
      }
    }
  }

  function handleVisibilityChange(){
    if (document.hidden) {
      timer.stop()
      second_timer.stop()
      clearInterval(intervalId)
      clearInterval(secondIntervalId)
      intervalId = null
      secondIntervalId = null
    } else {
      timer.start()
      if (isStopClockFired){
        second_timer.start()
      }
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
      secondIntervalId = secondIntervalId || setInterval(handleSecondIntervalTick, 300)
    }
  }

  function startSecondClock(){
    second_timer = new Timer(SECOND_TIMEOUT_IN_SECS)
    second_timer.start()
  }


  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  document.addEventListener("stopclock", startSecondClock);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main)
