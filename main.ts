///<reference path="jointjs.d.ts"/>
import bb = require("backbone");
import joint = require("jointjs");
import Paper = joint.dia.Paper;
import Graph = joint.dia.Graph;
import Rect = joint.shapes.basic.Rect;
import input = require("jquery.svg");

export class MainView extends bb.View<any> {
    paper: Paper;
    graph: Graph;

    constructor(options?) {
        this.el = "#MainView";
        this.events = <any>{
            "click .gg-add-goal": "addGoal"
        };

        super(options);

    }

    initialize():void {
        this.graph = new Graph();
        this.paper = initPaper(this.graph);
    }


    addGoal():void {
        /* TODO: for new Goal we need to:
         todo 1) create model, - check
         todo 2) add element (diagram_view ?) to diagram
         todo 3) save  Goal model to temp storage,
         todo 4) show detail view
         */
        var goalModel:GoalModel = new GoalModel("New Goal asdkj askdjh asdkjhsa dkjhas dkjh asd \r\n" +
            "k askjdhasdkjhs d", "");
        this.graph.addCell(addToGraph(goalModel));

    }

}

export class GoalModel extends bb.Model {
    name:string;
    description:string;

    constructor(name?:string, description?:string) {
        this.name = name;
        this.description = description;
        super()
    }
}


function initPaper(graph: Graph): Paper {
    var paper = new Paper({
        model: graph,
        el: "#graph-holder"
    });
    return paper;
}

function addToGraph(goal:GoalModel): Rect {
    var rect = new Rect();
    rect.attr({
        rect: {fill: 'blue', width: 100, height: 30},
        text: {text: goal.name, fill: 'green'}
    });
    rect.position(100, 100);
    //rect.resize(100, 30);
    return rect;
}

 // ************* Init MainView **************

var goalsView = new MainView();


var mousedownonelement = false;

window.getlocalmousecoord = function (svg, evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    var localpoint = pt.matrixTransform(svg.getScreenCTM().inverse());
    localpoint.x = Math.round(localpoint.x);
    localpoint.y = Math.round(localpoint.y);
    return localpoint;
};

window.createtext = function (localpoint, svg) {
    var myforeign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    var textdiv = document.createElement("div");
    var textnode = document.createTextNode("Click to edit");
    textdiv.appendChild(textnode);
    textdiv.setAttribute("contentEditable", "true");
    textdiv.setAttribute("width", "auto");
    myforeign.setAttribute("width", "100%");
    myforeign.setAttribute("height", "100%");
    myforeign.classList.add("foreign"); //to make div fit text
    textdiv.classList.add("insideforeign"); //to make div fit text
    textdiv.addEventListener("mousedown", elementMousedown, false);
    //myforeign.setAttributeNS(null, "transform", "translate(" + localpoint.x + " " + localpoint.y + ")");
    //svg.appendChild(myforeign);
    //document.getElementById("v-5").appendChild(myforeign);
    //myforeign.setAttribute("transform", $("#v-8").attr("transform"));
    $("#v-5").append(myforeign);
    myforeign.appendChild(textdiv);

};

function elementMousedown(evt) {
    mousedownonelement = true;
}

$(('#v-2')).click(function (evt) {
    var svg = document.getElementById('v-2');
    var localpoint = getlocalmousecoord(svg, evt);
    if (!mousedownonelement) {
        createtext(localpoint, svg);
    } else {
        mousedownonelement = false;
    }
});


