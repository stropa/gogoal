import bb = require("backbone");


export class GoalView extends bb.View<GoalModel> {

    constructor(options?) {
        this.el = "#gg-controls";
        this.events = <any>{
            "click .gg-add-goal": "addGoal"
        };

        super(options);

    }

    initialize():void {

    }


    addGoal():void {
        alert("Adding a goal");
        /* TODO: for new Goal we need to:
         todo 1) create model,
         todo 2) create view_model(JointJS element - Rect),
         todo 3) save  Goal model to temp storage,
         */
    }

}

export class GoalModel extends bb.Model {
    name:string;
    description:string
}

var goalsView = new GoalView()//;.setElement("#gg-controls");


/*
 export var ControlsView = Backbone.View.extend({
 el: "#gg-controls",
 initialize: function () {

 debugger;
 },
 events: {
 "click .gg-add-goal": "addGoal"
 },

 addGoal: function () {
 alert("Adding a goal");
 /!* TODO: for new Goal we need to:
 todo 1) create model,
 todo 2) create view_model(JointJS element - Rect),
 todo 3) save  Goal model to temp storage,
 *!/
 }

 });


 var controlsView = new ControlsView;*/
