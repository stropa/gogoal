function magic() {
    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({el: $('#paper'), width: 650, height: 400, gridSize: 1, model: graph});

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
            '</div>'
        ].join(''),

        initialize: function () {

            _.bindAll(this, 'updateBox', 'onTextInput');

            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

            this.$box = $(_.template(this.template)());
            this.$input = this.$box.find('textarea');
            this.$input.on('input', this.onTextInput);

            this.model.on('change', this.updateBox, this);
            this.model.on('remove', this.removeBox, this);

            this.updateBox();
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


// Create JointJS elements and add them to the graph as usual.
// -----------------------------------------------------------

    var el1 = new joint.shapes.html.Element({
        position: {x: 80, y: 80},
        size: {width: 170, height: 100}
    });
    var el2 = new joint.shapes.html.Element({
        position: {x: 370, y: 160},
        size: {width: 170, height: 100}
    });

    var l = new joint.dia.Link({
        source: {id: el1.id},
        target: {id: el2.id},
        attrs: {'.connection': {'stroke-width': 5, stroke: '#34495E'}}
    });

    graph.addCells([el1, el2, l]);

    paper.on('cell:pointerdblclick',
        function (cellView, evt, x, y) {
            var input = cellView.$box.find(".element-input");
            if (input) input.focus()
        }
    );
}


$(document).ready(magic);