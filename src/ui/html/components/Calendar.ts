// import Stylesheets from "../Stylesheets";
// import Model from "../../../data/Model";
// import Context from "../../Context";
// import State from "../../../data/State";
// import Key from "../../../data/Key";
// import HtmlContext from "../HtmlContext";
// import localize from "../../localize";


// Stylesheets.add(theme => `
//     BODY {
//         background: ${theme.colors.background};
//     }
//     .Calendar {
//         border: ${theme.colors.background} solid 1px;
//         background: ${theme.colors.background};
//         padding: ${theme.margin}px;
//         box-shadow: 5px 5px 10px #535353;
//         border: 1px silver;
//         resize: both;
//         overflow: auto;
//         display: flex;
//         flex-direction: column;
//         justify-content: space-evenly;
//         min-width: 260px;
//         min-height: 260px;
//         text-align: center;
//     }
//     .Month_Button {
//         flex: 1 1 auto;
//         text-align: center;
//         font-size: 25px;
//         max-width: 150px;
//         min-width: 50px;
//         border: ${theme.colors.foreground} solid 1px;
//         margin: 10px;
//     }
//     .Calendar_Display {
//         font-size: 20px;
//         min-width: 125px;
//         text-align: center;
//     }
//     .Calendar_Week {
//         text-align: center;
//         display: flex;
//         flex-direction: row;
//         justify-content: space-evenly;
//         white-space: pre;
//     }
//     .Calendar_Day {
//         background: ${theme.colors.background};
//         border: ${theme.colors.background} solid 1px;
//         font-size: 12px;
//         padding: ${theme.margin}px;
//         text-align: center;
//         max-width: 50px;
//         max-height: 50px;
//         display: flex;
//         flex-direction: column;
//     }
// `)

// @Model.class()
// class CalendarState extends State {

//     @Model.property({ type: "integer", default: 0 })
//     month!: number

//     @Model.property({ type: "integer", default: 2019 })
//     year!: number

//     @Model.property({ type: "integer", default: 1})
//     day!: number

//     static key = Key.create(CalendarState, "0")
// }

// const weeksThisMonth = 6
// const daysInWeek = 7

// function CalendarDay(c: Context, dateString: string) {
//     const { div, span, end, text } = HtmlContext(c)
//     let state = c.store.get(CalendarState.key)
//     let now = new Date()
//     let date = new Date(Date.parse(dateString))
//     let dayString = date.getDate().toString()
//     div({ class: "Calendar_Day", id: dateString})
//         let thisDiv = document.getElementById(dateString)!
//         //NEED MORE THEMESTATE PROPERTIES FOR FOLLOWING COLORS
//         let magicColorOne = "black"
//         let magicColorTwo = "white"
//         if (date.getMonth() !== state.month)
//             thisDiv.style.color = "grey"
//         else
//             thisDiv.style.color = "black"
//         if (date.toDateString() == now.toDateString()) {
//             thisDiv.style.color = "#ff0000"
//             thisDiv.style.border = magicColorOne + " solid 1px"
//         } else
//             thisDiv.style.border = magicColorTwo + " solid 1px"
//         if (dayString.length == 1)
//             dayString = "0" + dayString
//         c.text(`${dayString}`)
//     end()
// }

// function CalendarWeek(c: Context, startString: string) {
//     const { div, span, end, text } = HtmlContext(c);
//     let start = new Date(Date.parse(startString))
//     let startDate = start.getDate()
//     let startDay = start.getDay()
//     let startMonth = start.getMonth()
//     let startYear = start.getFullYear()
//     //just create an array and cap the length to 7 then check for 0-6 value for placement
//     div({class: "Calendar_Week"})
//         for (let i = 0; i < daysInWeek; i++) {
//             let displayDate = new Date(startYear, startMonth, startDate + i - startDay)
//             c.render(CalendarDay, displayDate.toDateString())
//         }
//     end()
// }
// export default Context.component((c: Context, p: {
//     id: string,
//     class?: string,
//     value?: string,
//     options?: object | any[],
//     onchange?: (value: string) => void
// }) => {
//     const { div, span, button, end, text } = HtmlContext(c);
//     let state = c.store.get(CalendarState.key)
//     let stateDate = new Date(state.year, state.month, state.day)
//     let DaysofTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

//     div({ class: "Calendar" }) //  block-element-modifier css naming style
//         div({ class: "Calendar_Week"})
//             //Previous Month button
//             div({
//                 class: "Month_Button",
//                 onclick() {
//                     c.store.patch(CalendarState.key, { month: state.month - 1 })
//                     if (state.month <= 0) {
//                         c.store.patch(CalendarState.key, { year: state.year - 1 })
//                         c.store.patch(CalendarState.key, { month: state.month + 11 })
//                     }
//                 }
//             })
//                 c.text(`←`)
//             end()
//             //Month and year display in the Middle
//             var options = { month: 'long'};
//             div({ class: "Calendar_Display" })
//                 c.text(`${stateDate.getFullYear()} \n ${new Intl.DateTimeFormat('en-US', options).format(stateDate)}`)
//             end()
//             //Next Month Button
//             div({
//                 class: "Month_Button",
//                 onclick() {
//                     c.store.patch(CalendarState.key, { month: state.month + 1 })
//                     if (state.month >= 11) {
//                         c.store.patch(CalendarState.key, { year: state.year + 1 })
//                         c.store.patch(CalendarState.key, { month: state.month - 11 })
//                     }
//                 }
//             })
//                 c.text(localize`→`)
//             end()
//         end()
//         //Creates the days of the week intitials
//         div({class: "Calendar_Week"})
//             for (let i = 0; i < daysInWeek; i++) {
//                 let divID = "day" + i.toString()
//                 div({class: "Calendar_Day", id: divID})
//                     document.getElementById(divID)!.style.height = "10px"
//                     c.text(localize`${DaysofTheWeek[i].toString().slice(0, 1)}`)
//                 end()
//             }
//         end()
//         //Creates the dates of the month
//         for (let i = 0; i < weeksThisMonth; i++) {
//             let newStart = new Date(state.year, state.month, i*7)
//             c.render(CalendarWeek, newStart.toDateString())
//         }
//     end()
// })
