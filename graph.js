function playbigsmall() {
    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 500,
        height: 300,
        model: graph,
        gridSize: 1
    });

    var paperSmall = new joint.dia.Paper({
        el: $('#myholder-small'),
        width: 600,
        height: 300,
        model: graph,
        gridSize: 1
    });

    var rect = new joint.shapes.basic.Rect({
        position: {x: 100, y: 30},
        size: {width: 100, height: 30},
        attrs: {rect: {fill: 'blue'}, text: {text: 'my box', fill: 'white', magnet:true}}
    });


    var rect2 = rect.clone();
    rect2.translate(300);

    rect.attr({
        rect: {fill: '#2C3E50', rx: 5, ry: 5, 'stroke-width': 2, stroke: 'black'},
        text: {
            text: 'my label', fill: '#3498DB',
            'font-size': 18, 'font-weight': 'bold', 'font-variant': 'small-caps', 'text-transform': 'capitalize'
        }
    });

    var link = new joint.dia.Link({
        source: {id: rect.id},
        target: {id: rect2.id}
    });


    graph.addCells([rect, rect2, link]);

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        if (!cellView.el.classList.contains("highlighted")) {
            cellView.highlight();
        } else {
            cellView.unhighlight();
        }
    });


    paperSmall.scale(.5);
    paperSmall.$el.css('pointer-events', 'none');
}