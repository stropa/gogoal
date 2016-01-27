///<reference path="jointjs.d.ts"/>
import bb = require("backbone");
import joint = require("jointjs");
import Paper = joint.dia.Paper;
import Graph = joint.dia.Graph;
import Rect = joint.shapes.basic.Rect;
import input = require("jquery.svg");

window.App = {
    Models: {selectionModel: SelectionModel}
};

function initCustoms() {
    // ********************************************************** Mix custom Elements for inline edit ***************************************
// Create a custom element.
// ------------------------

    joint.shapes.html = {};
    joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
        defaults: joint.util.deepSupplement({
            type: 'html.Element',
            attrs: {
                rect: {stroke: 'none', 'fill-opacity': 0}
            }
        }, joint.shapes.basic.Rect.prototype.defaults)
    });

// Create a custom view for that element that displays an HTML div above it.
// -------------------------------------------------------------------------

    joint.shapes.html.ElementView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element">',
            '<textarea class="element-input" />',
            '<span class="glyphicon glyphicon-arrow-right element-actions actions-top-right"></span>',
            '</div>'
        ].join(''),

        initialize: function () {

            _.bindAll(this, 'updateBox', 'onTextInput', 'startConnection');

            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

            this.$box = $(_.template(this.template)());

            this.$input = this.$box.find('textarea');
            this.$input.on('input', this.onTextInput);
            this.$input.val(this.model.attributes.text);

            this.$connect = this.$box.find(".actions-top-right");
            var myModel = this.model;

            this.$connect.on('mousedown', this.startConnection);

            this.model.on('change', this.updateBox, this);
            this.model.on('remove', this.removeBox, this);

            this.updateBox();
        },

        startConnection: function (evt) {
            var model = this.model;
            var holderOffset = $("#graph-holder").offset();
            var link = new joint.dia.Link({
                source: {id: this.model.id},
                target: {x: evt.pageX - holderOffset.left, y: evt.pageY - holderOffset.top}
            });
            this.model.graph.addCell(link);
            $(document).mousemove(function (moveEvent) {
                link.set('target', {x: moveEvent.pageX - holderOffset.left, y: moveEvent.pageY - holderOffset.top});
            });
            $(document).mouseup(function (moveEvent) {
                if (link == null) return;
                $(document).unbind('mousemove');
                if (window.App.Models.selectionModel.pointed && window.App.Models.selectionModel.pointed != model) {
                    var finalLink = new joint.dia.Link({
                        source: {id: link.getSourceElement().id},
                        target: {id: window.App.Models.selectionModel.pointed.id}
                    });
                    link.remove();
                    model.graph.addCell(finalLink);
                    link = null;
                }
            });
        },

        onTextInput: function (evt) {

            var $input = $(evt.target);
            //$input.attr('cols', Math.max($input.val().length, 10)); // ******************************************

            this.model.resize($input.outerWidth() + 15, $input[0].scrollHeight + 15);
            $input[0].style.height = 'auto';
            $input[0].style.height = $input[0].scrollHeight + "px";
            this.model.set('input', $input.val());
        },

        render: function () {
            joint.dia.ElementView.prototype.render.apply(this, arguments);
            this.paper.$el.prepend(this.$box);
            this.$input.trigger('input');
            return this;
        },

        updateBox: function () {
            // Set the position and dimension of the box so that it covers the JointJS element.
            var bbox = this.model.getBBox();
            // Example of updating the HTML with a data stored in the cell model.
            this.$box.css({
                width: bbox.width,
                height: bbox.height,
                left: bbox.x,
                top: bbox.y,
                transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
            });
        },

        removeBox: function (evt) {
            this.$box.remove();
        }
    });


}

export class MainView extends bb.View<any> {
    paper:Paper;
    graph:Graph;
    selectionModel:SelectionModel;

    constructor(selectionModel:SelectionModel, options?:any) {
        this.el = "#MainView";
        this.selectionModel = selectionModel;
        this.events = <any>{
            "click .gg-add-goal": "addGoal"
        };
        super(options);
    };

    initialize():void {
        this.graph = new Graph();
        this.paper = initPaper(this.graph);

        this.paper.on('cell:pointerdblclick',
            function (cellView, evt, x, y) {
                var input = cellView.$box.find(".element-input");
                if (input) input.focus()
            }
        );
        var selection = this.selectionModel;
        this.paper.on('cell:mouseover',
            function (cellView, evt, x, y) {
                if (cellView.model.attributes.type && cellView.model.attributes.type == 'html.Element') {
                    selection.pointed = cellView.model;
                }
            }
        );
    }


    addGoal():void {
        /* TODO: for new Goal we need to:
         todo 1) create model, - check
         todo 2) add element (diagram_view ?) to diagram - check
         todo 3) save  Goal model to temp storage,
         todo 4) show detail view
         */
        var goalModel:GoalModel = new GoalModel("New Goal", "");
        this.graph.addCell(addToGraph(goalModel));
    }

}

/** Contains elements which are currently selected or hovered by user. */
export class SelectionModel extends bb.Model {
    public pointed:bb.Model = null;
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


function initPaper(graph:Graph):Paper {
    var paper = new Paper({
        model: graph,
        el: "#graph-holder"
    });
    return paper;
}

function addToGraph(goal:GoalModel):Rect {
    return new joint.shapes.html.Element({
        position: {x: 80, y: 80},
        size: {width: 170, height: 100},
        text: goal.name
    });
}

// ************* Init MainView **************
initCustoms();

var goalsView = new MainView(new SelectionModel());
window.App.Models.selectionModel = goalsView.selectionModel;


