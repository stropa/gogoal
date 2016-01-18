/* SVG Input Elements for SVG jQuery (1.4.4).
 https://github.com/silence150/SVG-Input-Elements

 Written by
 Tim Brandin (info{at}sypreme.se),
 Josef Ottosson (josef.ottosson{at}josf.se) in 2012

 MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses.
 Please attribute the author if you use it.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE. */


(function ($) {
    Function.prototype.inheritsFrom = function (parentClassOrObject) {
        if (parentClassOrObject.constructor == Function) {
            this.prototype = new parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.super = parentClassOrObject.prototype;
        }
        else {
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.super = parentClassOrObject;
        }
        return this;
    }
    function isNumber(input) {
        return typeof(input) == 'number';
    }

    function isArray(a) {
        return (a && a.constructor == Array);
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt) {
            var len = this.length;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0)
                from += len;
            for (; from < len; from++) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }
    $.fn.disableSelection = function () {
        return this.each(function () {
            $(this).attr('unselectable', 'on').css({
                '-moz-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none',
                '-ms-user-select': 'none'
            }).each(function () {
                this.onselectstart = function () {
                    return false;
                };
            });
        });
    };
    var tId;
    $.event.special.tripleclick = {
        setup: function (data, namespaces) {
            var elem = this, $elem = jQuery(elem);
            $elem.bind('mouseup', jQuery.event.special.tripleclick.handler);
        }, teardown: function (namespaces) {
            var elem = this, $elem = jQuery(elem);
            $elem.unbind('mouseup', jQuery.event.special.tripleclick.handler)
        }, handler: function (event) {
            var elem = this, $elem = jQuery(elem), clicks = $elem.data('tclicks') || 0;
            clickpos = $elem.data('tclickpos') || -1;
            clicks += 1;
            clearTimeout(tId);
            tId = setTimeout(function () {
                clicks = 0;
                $elem.data('tclickpos', {x: -1, y: -1});
                $elem.data('tclicks', 0);
            }, 350);
            if (clicks === 2) {
                $elem.data('tclickpos', {x: event.clientX, y: event.clientY});
            }
            else if (clicks === 3) {
                var dist = Math.sqrt(Math.pow(clickpos.x - event.clientX, 2)
                    + Math.pow(clickpos.y - event.clientY, 2));
                clicks = 0;
                clearTimeout(tId);
                if (dist < 5) {
                    event.type = "tripleclick";
                    jQuery.event.handle.apply(this, arguments);
                }
                $elem.data('tclickpos', {x: -1, y: -1});
            }
            $elem.data('tclicks', clicks);
        }
    };
    var dId;
    $.event.special.doubleclick = {
        setup: function (data, namespaces) {
            var elem = this, $elem = jQuery(elem);
            $elem.bind('mousedown', jQuery.event.special.doubleclick.handler);
        }, teardown: function (namespaces) {
            var elem = this, $elem = jQuery(elem);
            $elem.unbind('mousedown', jQuery.event.special.doubleclick.handler)
        }, handler: function (event) {
            var elem = this, $elem = jQuery(elem);
            clicktime = $elem.data('dclickstime') || -1;
            clickpos = $elem.data('dclickpos') || -1;
            if (clicktime < 0 || (clicktime > 0 && new Date().getTime() - clicktime > 500)) {
                clicktime = new Date().getTime();
                $elem.data('dclickstime', clicktime);
                $elem.data('dclickpos', {x: event.clientX, y: event.clientY});
            }
            else {
                if (new Date().getTime() - clicktime < 500) {
                    var dist = Math.sqrt(Math.pow(clickpos.x - event.clientX, 2)
                        + Math.pow(clickpos.y - event.clientY, 2));
                    if (dist < 5) {
                        event.type = "doubleclick";
                        jQuery.event.handle.apply(this, arguments);
                    }
                }
                $elem.data('dclickstime', -1);
                $elem.data('dclickpos', {x: -1, y: -1});
            }
        }
    };
    var types = [SVGGElement, SVGTextElement, SVGTSpanElement, SVGRectElement, SVGImageElement];
    var typeNames = types.map(function (e, i) {
        return e.name;
    });
    var StyleSheet = {
        StyleCache: {}, getAllStyles: function (selector, parent) {
            return this._get(selector, undefined, parent);
        }, get: function (selector, style, parent) {
            style = style || "";
            strParent = this._parentToString(parent);
            if (this.StyleCache[strParent] !== undefined && this.StyleCache[strParent][selector] !== undefined && this.StyleCache[strParent][selector][style] !== undefined) {
                return this.StyleCache[strParent][selector][style];
            }
            else {
                return this._get(selector, style, parent);
            }
        }, _get: function (selector, style, parent) {
            var selectorRegExp = /^([\w]*)(\#[\w]+)?(\.[\w]+)?$/;
            var heritageRegExp = /^(.*[^>])(\s+|\s*\>\s*)([\w\.\#]+)$/;
            var result = '';
            if (style !== undefined) {
                var ccStyle = $.camelCase(style);
            }
            $.each(document.styleSheets, function (i, styleSheet) {
                _parseRules(styleSheet.cssRules);
                function _parseRules(cssRules) {
                    $.each(cssRules, function (i, ruleBundle) {
                        if (ruleBundle.styleSheet) {
                            cssRules = ruleBundle.styleSheet.cssRules;
                            _parseRules(cssRules);
                        }
                        else {
                            if (ruleBundle.selectorText) {
                                $.each(ruleBundle.selectorText.split(","), function (i, rule) {
                                    var heritageOk = true;
                                    if (heritageRegExp.test(rule.trim())) {
                                        var heritage = heritageRegExp.exec(rule.trim());
                                        heritageOk = $(parent).is(heritage[1]);
                                        rule = heritage[3];
                                    }
                                    r = selectorRegExp.exec(rule.trim());
                                    s = selectorRegExp.exec(selector);
                                    if (r != null && s != null) {
                                        tagOk = (r[1] == '' || r[1] == s[1]);
                                        idOk = (r[2] == undefined || r[2] == s[2]);
                                        classOk = (r[3] == undefined || r[3] == s[3]);
                                        if (tagOk && idOk && classOk && heritageOk) {
                                            if (style === undefined) {
                                                $.each(ruleBundle.style, function (key, val) {
                                                    if (val) {
                                                        result += val
                                                            + ": "
                                                            + ruleBundle.style[val]
                                                            + "; ";
                                                    }
                                                });
                                            }
                                            else {
                                                if (typeof ruleBundle.style[style] != 'undefined' && ruleBundle.style[style] !== '') {
                                                    result = ruleBundle.style[style];
                                                }
                                                else if (typeof ruleBundle.style[ccStyle] != 'undefined' && ruleBundle.style[ccStyle] !== '') {
                                                    result = ruleBundle.style[ccStyle];
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
            this.cache(selector, style, result, parent);
            return result;
        }, _parentToString: function (parent) {
            if (parent) {
                return parent.nodeName
                    + "--" + (parent.getAttribute('id') || "")
                    + "--" + (parent.getAttribute('class') || "").replace(" ", ".");
            }
            else {
                return "";
            }
        }, cache: function (selector, style, value, parent) {
            parent = this._parentToString(parent);
            if (this.StyleCache[parent] === undefined) {
                this.StyleCache[parent] = {};
            }
            if (this.StyleCache[parent][selector] === undefined) {
                this.StyleCache[parent][selector] = {};
            }
            if (this.StyleCache[parent][selector][style] === undefined) {
                this.StyleCache[parent][selector][style] = value;
            }
            return value;
        }
    }

    function num(val) {
        num
        return val != null && typeof(val) != 'undefined' ? parseInt(val || 0) : 0;
    }

    var elems = [], destroyerId;

    function destroyElem(element) {
        elems.push(element);
        clearTimeout(destroyerId);
        destroyerId = setTimeout(function () {
            destroyer()
        }, 100);
    }

    function destroyer() {
        if (elems.length > 0) {
            element = elems.pop();
            element.innerHTML = '';
            $(element).remove();
            destroyerId = setTimeout(function () {
                destroyer()
            }, 10);
        }
    }

    $.each(types, function (i, t) {
        if (t !== SVGRectElement && t !== SVGImageElement) {
            $.extend(t.prototype, {
                width: function () {
                    if (t === SVGTSpanElement) {
                        var len = this.getSubStringLength(0, this.firstChild.data.length);
                        if ($.browser.mozilla) {
                            len = Math.max(0, Math.ceil(len - 8));
                        }
                        return len;
                    } else {
                        return this.getBBox().width;
                    }
                }, height: function () {
                    if (t === SVGTSpanElement) {
                        g = SVGSelectableGElement._getGroupTarget(this);
                        return num(StyleSheet.get('text', 'line-height', g));
                    } else {
                        var height = this.getBBox().height;
                        if ($.browser.mozilla && t === SVGGElement) {
                            var tpad = num(StyleSheet.get('text', 'padding-bottom', this));
                            height += Math.min(num(StyleSheet.get('rect.textbox', 'padding-bottom', this)), tpad / (tpad > 10 ? 1.2 : (tpad > 6 ? 0.9 : 0.8)));
                        }
                        return height;
                    }
                }
            });
        }
        $.extend(t.prototype, {
            offset: function () {
                if (t === SVGTSpanElement) {
                    var dx = num(this.getAttribute('dx'));
                    var dy = num(this.getAttribute('dy'));
                    dy += num(this.parentNode.getAttribute('y'));
                    var prev = this.previousSibling;
                    while (prev != null) {
                        dy += num(prev.getAttribute('dy'));
                        prev = prev.previousSibling;
                    }
                    return {left: dx, top: dy}
                } else if (t !== SVGTSpanElement) {
                    return {
                        left: this.getCTM().e + num(this.getAttribute('x')),
                        top: this.getCTM().f + num(this.getAttribute('y'))
                    }
                }
                return {
                    left: this.getCTM().e - this.parentNode.getCTM().e + num(this.getAttribute('x')),
                    top: this.getCTM().f - this.parentNode.getCTM().f + num(this.getAttribute('y'))
                }
            }, position: function () {
                if (t === SVGTSpanElement) {
                    var screenCTM = this.parentNode.getScreenCTM();
                    var x = num(this.parentNode.getAttribute('x'));
                    var y = num(this.parentNode.getAttribute('y'));
                    var dx = num(this.getAttribute('dx'));
                    var dy = num(this.getAttribute('dy'));
                    var prev = this.previousSibling;
                    while (prev != null) {
                        dy += num(prev.getAttribute('dy'));
                        prev = prev.previousSibling;
                    }
                    return {
                        left: Math.round(screenCTM.e + (x + dx) * screenCTM.a),
                        top: Math.round(screenCTM.f + (y + dy) * screenCTM.d)
                    }
                }
                var pos;
                if (typeof this.getScreenCTM == 'function') {
                    var pos = this.getScreenCTM();
                }
                else {
                    var pos = $(this).position();
                }
                return {left: Math.round(pos.e), top: Math.round(pos.f)};
            }
        });
    });
    $.svg.addExtension('input', SVGInputElements);
    function SVGInputElements(wrapper) {
        this._wrapper = wrapper;
        this._eventmanager;
    }

    $.extend(SVGInputElements.prototype, {
        textArea: function (parent, x, y, value, settings) {
            var args = this._wrapper._args(arguments, ['x', 'y', 'value']);
            if (typeof args.x == 'string' && arguments.length < 4) {
                args.value = args.x;
                args.settings = args.y;
                args.x = args.y = null;
            }
            return this._textArea(args.parent, args.value, $.extend({
                x: (args.x && isArray(args.x) ? args.x.join(' ') : args.x),
                y: (args.y && isArray(args.y) ? args.y.join(' ') : args.y)
            }, args.settings || {}));
        }, _textArea: function (parent, value, settings) {
            if (typeof settings.width == 'undefined') {
                if (box = parent.getBBox()) {
                    width = box.width;
                }
            }
            width = (typeof settings.width == 'undefined') ? -1 : settings.width;
            height = (typeof settings.height == 'undefined') ? -1 : settings.height;
            delete settings.width;
            delete settings.height;
            return (new SVGEditableTextBox(this._wrapper)).init(parent, value, width, height, settings);
        }, list: function (parent, x, y, value, settings) {
            var args = this._wrapper._args(arguments, ['x', 'y', 'value']);
            if (typeof args.x == 'string' && arguments.length < 4) {
                args.value = args.x;
                args.settings = args.y;
                args.x = args.y = null;
            }
            return this._list(args.parent, args.value, $.extend({
                x: (args.x && isArray(args.x) ? args.x.join(' ') : args.x),
                y: (args.y && isArray(args.y) ? args.y.join(' ') : args.y)
            }, args.settings || {}));
        }, _list: function (parent, value, settings) {
            width = (typeof settings.width == 'undefined') ? -1 : settings.width;
            height = (typeof settings.height == 'undefined') ? -1 : settings.height;
            delete settings.width;
            delete settings.height;
            return (new SVGEditableList(this._wrapper)).init(parent, value, width, height, settings);
        }, text: function (parent, x, y, value, settings) {
            var args = this._wrapper._args(arguments, ['x', 'y', 'value']);
            if (typeof args.x == 'string' && arguments.length < 4) {
                args.value = args.x;
                args.settings = args.y;
                args.x = args.y = null;
            }
            return this._text(args.parent, args.value, $.extend({
                x: (args.x && isArray(args.x) ? args.x.join(' ') : args.x),
                y: (args.y && isArray(args.y) ? args.y.join(' ') : args.y)
            }, args.settings || {}));
        }, _text: function (parent, value, settings) {
            width = (typeof settings.width == 'undefined') ? -1 : settings.width;
            height = (typeof settings.height == 'undefined') ? -1 : settings.height;
            delete settings.width;
            delete settings.height;
            return (new SVGEditableText(this._wrapper)).init(parent, value, width, height, settings);
        }, image: function (parent, x, y, value, settings) {
            var args = this._wrapper._args(arguments, ['x', 'y', 'value']);
            if (typeof args.x == 'string' && arguments.length < 4) {
                args.value = args.x;
                args.settings = args.y;
                args.x = args.y = null;
            }
            return this._image(args.parent, args.value, $.extend({
                x: (args.x && isArray(args.x) ? args.x.join(' ') : args.x),
                y: (args.y && isArray(args.y) ? args.y.join(' ') : args.y)
            }, args.settings || {}));
        }, _image: function (parent, value, settings) {
            width = (typeof settings.width == 'undefined') ? -1 : settings.width;
            height = (typeof settings.height == 'undefined') ? -1 : settings.height;
            delete settings.width;
            delete settings.height;
            return (new SVGEditableImage(this._wrapper)).init(parent, value, width, height, settings);
        }
    });
    function SVGSelectableGElement() {
    }

    $.extend(SVGSelectableGElement, {
        _once: false, _instances: [], setup: function (instance) {
            if ($.inArray(instance, this._instances) == -1)
                this._instances.push(instance);
            if (!this._once) {
                var that = this;
                $(window).bind('mousedown.' + this.name, function (e) {
                    that._mousedown(e);
                });
                $(window).bind('mouseup.' + this.name, function (e) {
                    that._mouseup(e);
                });
                $(window).bind('mousemove.' + this.name, function (e) {
                    that._mousemove(e);
                });
                $(window).bind('click.' + this.name, function (e) {
                    that._click(e);
                });
                $(window).bind('doubleclick.' + this.name, function (e) {
                    that._dblclick(e);
                });
                $(window).bind('tripleclick.' + this.name, function (e) {
                    that._tplclick(e);
                });
                $(window).bind('contextmenu.' + this.name, function (e) {
                    that._contextmenu(e);
                });
                this._once = true;
            }
        }, deselectAll: function () {
            select = $('#select');
            if (select.length) {
                classes = (s = select.parent().attr('class')) ? s.replace('selected', '') : '';
                select.parent().attr('class', classes.trim());
                select.remove();
                $('#textbox-marker').css({display: 'none'});
            }
            $.each(this._instances, function (i, el) {
                el._deselect();
            });
        }, selectedGroup: function () {
            var selectedGroup = null;
            $.each(this._instances, function (i, el) {
                if (el.selected) {
                    selectedGroup = el;
                }
            });
            return selectedGroup;
        }, destroy: function (instance) {
            this._instances = $.grep(this._instances, function (e) {
                return e !== instance;
            });
        }, _mouseup: function (e) {
            var g;
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    if (el.selected) {
                        e.target = g;
                        el.trigger(e);
                        el.mouseup(g, e);
                    }
                });
            } else {
                var g = this.selectedGroup();
                if (g) {
                    e.target = g._group;
                    g.trigger(e);
                    g.mouseup(g._group, e);
                }
            }
        }, _mousedown: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                if (g) {
                    e.target = g;
                    g._selectable.trigger(e);
                    if (!g._selected) {
                        $(g).parent().append(g);
                        g.select(g, e);
                    }
                }
                else {
                    SVGSelectableGElement.deselectAll();
                }
            }
            else {
                SVGSelectableGElement.deselectAll();
            }
            $.each(this._instances, function (i, el) {
                el.mousedown(g, e);
            })
        }, _mousemove: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    if (el.selected && el._group == g) {
                        el.mousemove(g, e);
                        e.target = g;
                        g._selectable.trigger(e);
                    }
                    else {
                        g2 = SVGSelectableGElement.selectedGroup();
                        if (g2) {
                            e.target = g2;
                            g2.mousemove(g2._group, e);
                            e.target = g2._group;
                            g2.trigger(e);
                        }
                    }
                });
            } else {
                g = SVGSelectableGElement.selectedGroup();
                if (g) {
                    g.mousemove(g._group, e);
                    e.target = g._group;
                    g.trigger(e);
                }
            }
        }, _click: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    el.click(g, e);
                });
            }
        }, _dblclick: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    el.dblclick(g, e);
                });
            }
        }, _tplclick: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    el.tplclick(g, e);
                });
            }
        }, _contextmenu: function (e) {
            if ($.inArray(e.target.constructor, types) != -1) {
                var g = this._getGroupTarget(e.target);
                $.each(this._instances, function (i, el) {
                    el.contextmenu(g, e);
                });
            }
        }, _getGroupTarget: function (i) {
            var g;
            while (g == null) {
                if (i.constructor === SVGGElement && $(i).is('.selectable')) {
                    g = i;
                }
                else if (i.parentNode) {
                    i = i.parentNode;
                }
                else {
                    break;
                }
            }
            return g;
        }
    });
    $.extend(SVGSelectableGElement.prototype, {
        _group: null,
        selected: false,
        _class: 'selectable',
        _events: null,
        _parent: null,
        _destroyed: false,
        bind: function () {
            this._events.bind.apply(this._events, arguments);
        },
        unbind: function () {
            this._events.unbind.apply(this._events, arguments);
        },
        trigger: function () {
            this._events.trigger.apply(this._events, arguments);
        },
        init: function () {
            this._events = this._eventmanager = $('<input>'), SVGSelectableGElement.setup(this);
        },
        destroy: function () {
            SVGSelectableGElement.destroy(this);
            this._destroyed = true;
        },
        isSelected: function () {
            return this.selected;
        },
        appendTo: function (parent) {
            this._parent = parent;
        },
        _render: function () {
            var that = this;
            if (this._wrapper && !this._destroyed) {
                var classes;
                if (this._group) {
                    this._group.setAttribute('transform', 'translate(-9999,-9999)');
                    classes = this._group.getAttribute('class');
                    this._group.removeAttribute('class');
                    destroyElem(this._group);
                }
                else {
                    classes = this._class;
                }
                this._group = this._wrapper.group(arguments[0], arguments[1], arguments[2]);
                (classes ? this._group.setAttribute('class', classes) : 0);
                $.extend(this._group, {
                    _wrapper: this._wrapper, _selectable: this, _selected: this.selected, select: function (e) {
                        if (!this._selected)
                            SVGSelectableGElement.deselectAll();
                        this._selected = true;
                        this.setAttribute('class', this.getAttribute('class').trim() + ' selected');
                        this._render();
                        this._selectable._select(this, e);
                    }, reload: function () {
                        this._render();
                    }, _render: function () {
                        if (this._selected && !that._destroyed) {
                            background = $(this).find("rect.background")[0].getBBox();
                            this._wrapper.rect(this, 0, 0, background.width, background.height, {id: 'select'});
                        }
                    },
                });
                return this._group;
            }
        },
        _select: function (g, e) {
            this.selected = true;
            this.select(g, e);
        },
        _deselect: function () {
            this.selected = false;
            this._group._selected = false;
            this.deselect();
        },
        _delete: function () {
            this.trigger('delete');
        },
        remove: function () {
            $(this._group).remove();
            this.destroy();
        },
        setValue: function (value) {
            this._value = value;
        },
        select: function (g, e) {
        },
        deselect: function () {
        },
        mouseup: function (g, e) {
        },
        mousedown: function (g, e) {
        },
        mousemove: function (g, e) {
        },
        click: function (g, e) {
        },
        dblclick: function (g, e) {
        },
        tplclick: function (g, e) {
        },
        contextmenu: function (g, e) {
        }
    });
    function SVGEditableTextBox(wrapper) {
        this._wrapper = wrapper;
    }

    SVGEditableTextBox.inheritsFrom(SVGSelectableGElement);
    $.extend(SVGEditableTextBox, {
        once: false, _wordCache: {}, _textareaCount: 0, setup: function () {
            if (!this.once) {
                $(window).bind('keypress.' + this.name, function (e) {
                    var selectedGroup = SVGSelectableGElement.selectedGroup();
                    var that = this;
                    if (selectedGroup && selectedGroup.constructor === SVGEditableTextBox) {
                        char = String.fromCharCode(e.which);
                        if (!(e.shiftKey && ((e.keyCode > 36 && e.keyCode < 41 && !e.ctrlKey) || (e.keyCode > 34 && e.keyCode < 37)))) {
                            selectedGroup._selectStartCoord = null;
                            selectedGroup.removeSelection();
                        }
                        var charPosition = selectedGroup._textPosition, pos = selectedGroup._getTextPosition(charPosition), paragraph = pos.paragraph, row = pos.row;
                        switch (e.which) {
                            case 13:
                                char = e.shiftKey ? "\r" : "\n";
                                break;
                            case 32:
                                char = "\u00A0";
                                break;
                            default:
                        }
                        selectedGroup._setText(selectedGroup._text.substring(0, charPosition)
                            + char
                            + selectedGroup._text.substring(charPosition), charPosition + 1);
                        e.preventDefault();
                        selectedGroup.update();
                    }
                });
                $(window).bind('keydown.' + this.name, function (e) {
                    var stopDefault = true, cancelUpdate = true;
                    var selectedGroup = SVGSelectableGElement.selectedGroup();
                    var markall = false;
                    var unselect_marker = false;
                    if (selectedGroup && selectedGroup.constructor === SVGEditableTextBox) {
                        var keepDesiredX = false;
                        var charPosition = selectedGroup._textPosition, possi = selectedGroup._getTextPosition(charPosition), paragraph = possi.paragraph, row = possi.row;
                        if (e.shiftKey && (e.keyCode < 35 || e.keyCode > 40)) {
                            if (selectedGroup._selection) {
                                selectedGroup._selectStartCoord = selectedGroup._selection.start;
                            }
                        }
                        else if (e.shiftKey && ((e.keyCode > 36 && e.keyCode < 41 && !e.ctrlKey) || (e.keyCode > 34 && e.keyCode < 37))) {
                            if (!selectedGroup._selectStartCoord) {
                                selectedGroup._selectStartCoord = selectedGroup._getCoordInTextbox(selectedGroup._group, possi.paragraph + 1, possi.row + 1, possi.char);
                                selectedGroup._selection = null;
                            }
                        }
                        else if (e.keyCode > 34 && e.keyCode < 41) {
                            selectedGroup._selectStartCoord = null;
                        }
                        if (e.metaKey || e.ctrlKey) {
                            stopDefault = true;
                            switch (e.keyCode) {
                                case 35:
                                    var c = selectedGroup._textPositions[paragraph][row];
                                    if (selectedGroup._text[c] == ' ' && c != 0)
                                        c = c + 1;
                                    selectedGroup._textPosition = c;
                                    break;
                                case 36:
                                    selectedGroup._textPosition = 0;
                                    break;
                                case 65:
                                    markall = true;
                                    var endpos = selectedGroup._getTextPosition(selectedGroup._text.length - 1);
                                    var stopcoord = selectedGroup._getCoordInTextbox(selectedGroup._group, endpos.paragraph + 1, endpos.row + 1, 999999);
                                    selectedGroup._selectStartCoord = selectedGroup._getCoordInTextbox(selectedGroup._group, 1, 1, 0);
                                    selectedGroup._selection = {
                                        start: selectedGroup._selectStartCoord,
                                        stop: stopcoord
                                    };
                                    selectedGroup._drawMarking(selectedGroup._group, stopcoord);
                                    selectedGroup._selectStartCoord = null;
                                    SVGTextMarker.hide();
                                    selectedGroup._textPosition = selectedGroup._text.length;
                                    break;
                                case 67:
                                    tx = $('<textarea>' + selectedGroup.getSelectedText().replace(/\r/g, String.fromCharCode(11)) + '</textarea>');
                                    dump = $('<div class="dump">').css({
                                        position: 'absolute',
                                        top: '-9999px',
                                        left: '-9999px'
                                    }).prepend(tx);
                                    $('body').prepend(dump);
                                    tx.bind('change', function (e) {
                                        console.log('change');
                                    });
                                    tx.bind('copy', function (e) {
                                        setTimeout(function () {
                                            dump.remove();
                                        }, 100);
                                    });
                                    tx.focus();
                                    tx.select();
                                    stopDefault = false;
                                    break;
                                case 83:
                                    e.preventDefault();
                                    break;
                                case 86:
                                    tx = $('<textarea></textarea>');
                                    dump = $('<div class="dump">').css({
                                        position: 'absolute',
                                        top: '-9999px',
                                        left: '-9999px'
                                    }).prepend(tx);
                                    $('body').prepend(dump);
                                    tx.bind('change', function (e) {
                                        console.log('change');
                                    });
                                    tx.bind('paste', function (e) {
                                        that = this;
                                        setTimeout(function () {
                                            var newtxt = $(that).val();
                                            if (selectedGroup._selection) {
                                                selectedGroup.removeSelection();
                                            }
                                            selectedGroup._setText(selectedGroup._text.substring(0, selectedGroup._textPosition)
                                                + newtxt
                                                + selectedGroup._text.substring(selectedGroup._textPosition, selectedGroup._text.length - 1), selectedGroup._textPosition + newtxt.length);
                                            dump.remove();
                                            selectedGroup.update();
                                        }, 0);
                                    });
                                    tx.focus();
                                    stopDefault = false;
                                    break;
                                case 88:
                                    if (selectedGroup._selection) {
                                        tx = $('<textarea>' + selectedGroup.getSelectedText().replace(/\r/g, String.fromCharCode(11)) + '</textarea>');
                                        selectedGroup.removeSelection();
                                        selectedGroup._setText(selectedGroup._text, selectedGroup._textPosition);
                                        dump = $('<div class="dump">').css({
                                            position: 'absolute',
                                            top: '-9999px',
                                            left: '-9999px'
                                        }).prepend(tx);
                                        $('body').prepend(dump);
                                        tx.bind('change', function (e) {
                                            console.log('change');
                                        });
                                        tx.bind('copy', function (e) {
                                            setTimeout(function () {
                                                dump.remove();
                                            }, 100);
                                        });
                                        tx.focus();
                                        tx.select();
                                        stopDefault = false;
                                    }
                                    cancelUpdate = false;
                                    break;
                                case 90:
                                    if (e.shiftKey) {
                                        selectedGroup._historyRedo();
                                    }
                                    else {
                                        selectedGroup._historyUndo();
                                    }
                                    break;
                                default:
                                    stopDefault = false;
                            }
                        }
                        if (e.metaKey) {
                            stopDefault = true;
                            switch (e.keyCode) {
                                case 8:
                                    if (selectedGroup._selection) {
                                        selectedGroup.removeSelection();
                                    } else {
                                        selectedGroup._setText(selectedGroup._text.substring(0, selectedGroup._textPositions[paragraph][row])
                                            + selectedGroup._text.substring(charPosition), Math.max(0, selectedGroup._textPositions[paragraph][row]));
                                        cancelUpdate = false;
                                        break;
                                    }
                                    break;
                                case 37:
                                    selectedGroup._textPosition = selectedGroup._textPositions[paragraph][row];
                                    break;
                                case 38:
                                    selectedGroup._textPosition = 0;
                                    break;
                                case 39:
                                    selectedGroup._textPosition = selectedGroup._getEndOfRowPosition(paragraph, row);
                                    break;
                                case 40:
                                    var v = selectedGroup._textPositions;
                                    selectedGroup._textPosition = selectedGroup._text.length;
                                    break;
                                default:
                                    stopDefault = false;
                            }
                        }
                        if (!e.metaKey && !e.ctrlKey) {
                            switch (e.which) {
                                case 8:
                                    if (selectedGroup._selection) {
                                        selectedGroup.removeSelection();
                                        selectedGroup._setText(selectedGroup._text, selectedGroup._textPosition);
                                    } else if (SVGTextMarker.isVisible()) {
                                        selectedGroup._setText(selectedGroup._text.substring(0, charPosition - 1)
                                            + selectedGroup._text.substring(charPosition), Math.max(0, charPosition - 1));
                                    }
                                    if (!selectedGroup._contextMenu && !(selectedGroup._selection || SVGTextMarker.isVisible())) {
                                        selectedGroup._delete();
                                    }
                                    cancelUpdate = false;
                                    break;
                                case 27:
                                    if (selectedGroup._contextMenu) {
                                        selectedGroup.closeContextMenu();
                                    }
                                    else if (selectedGroup._selection || SVGTextMarker.isVisible()) {
                                        selectedGroup.stopEditing();
                                    }
                                    else {
                                        SVGSelectableGElement.deselectAll();
                                    }
                                    break;
                                case 35:
                                    selectedGroup._textPosition = selectedGroup._getEndOfRowPosition(paragraph, row);
                                    break;
                                case 36:
                                    selectedGroup._textPosition = selectedGroup._textPositions[paragraph][row];
                                    break;
                                case 37:
                                    if (!selectedGroup._selection || e.shiftKey)
                                        selectedGroup._textPosition = Math.max(charPosition - 1, 0); else if (!e.shiftKey) {
                                        var pa = selectedGroup._selection.start.paragraph, ro = selectedGroup._selection.start.row, ch = selectedGroup._selection.start.char;
                                        if ((pa == selectedGroup._selection.stop.paragraph && ro == selectedGroup._selection.stop.row && ch > selectedGroup._selection.stop.char) || (pa == selectedGroup._selection.stop.paragraph && ro > selectedGroup._selection.stop.row) || (pa > selectedGroup._selection.stop.paragraph)) {
                                            pa = selectedGroup._selection.stop.paragraph;
                                            ro = selectedGroup._selection.stop.row;
                                            ch = selectedGroup._selection.stop.char;
                                        }
                                        selectedGroup._textPosition = selectedGroup._textPositions[pa - 1][ro - 1] + ch;
                                    }
                                    break;
                                case 38:
                                    keepDesiredX = true;
                                    selectedGroup._moveDown = false;
                                    var dscx;
                                    if (selectedGroup._selection && !e.shiftKey) {
                                        paragraph = selectedGroup._selection.start.paragraph - 1, row = selectedGroup._selection.start.row - 1;
                                        dscx = selectedGroup._selection.start.x;
                                        if (row == selectedGroup._selection.start.row - 1 && paragraph == selectedGroup._selection.stop.paragraph - 1)
                                            dscx = Math.min(selectedGroup._selection.stop.x, selectedGroup._selection.start.x);
                                        if ((paragraph == selectedGroup._selection.stop.paragraph - 1 && row > selectedGroup._selection.stop.row - 1) || (paragraph > selectedGroup._selection.stop.paragraph - 1)) {
                                            paragraph = selectedGroup._selection.stop.paragraph - 1, row = selectedGroup._selection.stop.row - 1;
                                            dscx = selectedGroup._selection.stop.x;
                                        }
                                    }
                                    var t = selectedGroup._textPositions, p = row - 1 < 0 ? paragraph - 1 : paragraph, r = row - 1 < 0 ? (t[p] || [0]).length - 1 : row - 1, rp = t[Math.max(0, p)][r];
                                    var desx = (t[p] || !e.shiftKey ? (dscx || SVGTextMarker.getDesiredX()) * selectedGroup._group.getScreenCTM().a : 0), coord = selectedGroup._getCoordInRowNearX(selectedGroup._group, Math.max(0, p) + 1, r + 1, desx), c = rp + coord.char;
                                    if (coord) {
                                        var len = t[paragraph][row] - rp, char = selectedGroup._text[c - 1];
                                        c -= (/\s/.test(char) && coord.char != 0 ? 1 : 0);
                                    }
                                    selectedGroup._textPosition = c;
                                    break;
                                case 39:
                                    if (!selectedGroup._selection || e.shiftKey) {
                                        selectedGroup._textPosition = Math.min(charPosition + 1, selectedGroup._text.length);
                                    }
                                    else if (!e.shiftKey) {
                                        var pa = selectedGroup._selection.stop.paragraph, ro = selectedGroup._selection.stop.row, ch = selectedGroup._selection.stop.char;
                                        if ((pa == selectedGroup._selection.start.paragraph && ro == selectedGroup._selection.start.row && ch < selectedGroup._selection.start.char) || (pa == selectedGroup._selection.start.paragraph && ro < selectedGroup._selection.start.row) || (pa < selectedGroup._selection.start.paragraph)) {
                                            pa = selectedGroup._selection.start.paragraph;
                                            ro = selectedGroup._selection.start.row;
                                            ch = selectedGroup._selection.start.char;
                                        }
                                        selectedGroup._textPosition = selectedGroup._textPositions[pa - 1][ro - 1] + ch;
                                    }
                                    break;
                                case 40:
                                    keepDesiredX = true;
                                    selectedGroup._moveDown = true;
                                    if (selectedGroup._selection && !e.shiftKey) {
                                        paragraph = selectedGroup._selection.stop.paragraph - 1, row = selectedGroup._selection.stop.row - 1;
                                        dscx = selectedGroup._selection.stop.x;
                                        if (row == selectedGroup._selection.start.row - 1 && paragraph == selectedGroup._selection.stop.paragraph - 1)
                                            dscx = Math.max(selectedGroup._selection.stop.x, selectedGroup._selection.start.x);
                                        if ((paragraph == selectedGroup._selection.start.paragraph - 1 && row < selectedGroup._selection.start.row - 1) || (paragraph < selectedGroup._selection.start.paragraph - 1)) {
                                            paragraph = selectedGroup._selection.start.paragraph - 1, row = selectedGroup._selection.start.row - 1, dscx = selectedGroup._selection.start.x;
                                        }
                                    }
                                    var t = selectedGroup._textPositions, np = paragraph + (t.length > paragraph + 1 ? 1 : 0)
                                    p = row + 1 >= t[paragraph].length ? np : paragraph, r = row + 1 >= t[paragraph].length ? (paragraph + 1 > t.length - 1 ? t[p].length - 1 : 0) : row + 1, rp = t[p][r];
                                    var desx = (e.shiftKey && p == t.length - 1 && t[p].length == row + 1 ? 999999 : (dscx || SVGTextMarker.getDesiredX()) * selectedGroup._group.getScreenCTM().a), coord = selectedGroup._getCoordInRowNearX(selectedGroup._group, p + 1, r + 1, desx), c = rp + coord.char;
                                    if (coord) {
                                        var len = rp - t[paragraph][row], char = selectedGroup._text[c - 1];
                                        c -= (/\s/.test(char) && coord.char != 0 && coord.char != len ? 1 : 0);
                                    }
                                    selectedGroup._textPosition = c;
                                    break;
                                case 46:
                                    if (selectedGroup._selection) {
                                        selectedGroup.removeSelection();
                                    } else if (selectedGroup._selection || SVGTextMarker.isVisible()) {
                                        selectedGroup._setText(selectedGroup._text.substring(0, charPosition)
                                            + selectedGroup._text.substring(charPosition + 1), charPosition);
                                        cancelUpdate = false;
                                        break;
                                    }
                                    if (!selectedGroup._contextMenu && !(selectedGroup._selection || SVGTextMarker.isVisible())) {
                                        selectedGroup._delete();
                                    }
                                    cancelUpdate = false;
                                    break;
                                default:
                                    stopDefault = false;
                            }
                        }
                        if (stopDefault) {
                            e.preventDefault();
                            (cancelUpdate ? 0 : selectedGroup.update());
                        }
                        selectedGroup._keepDesiredX = keepDesiredX;
                        (cancelUpdate ? 0 : selectedGroup.update());
                        if (cancelUpdate && !markall) {
                            var lineHeight = num(StyleSheet.get('text', 'line-height', selectedGroup._group));
                            var possi = selectedGroup._getTextPosition(selectedGroup._textPosition);
                            var coord = selectedGroup._getCoordInTextbox(selectedGroup._group, possi.paragraph + 1, possi.row + 1, possi.char);
                            if (selectedGroup._group._selected && !unselect_marker) {
                                var desx = (selectedGroup._keepDesiredX ? SVGTextMarker.getDesiredX() : coord.x);
                                SVGTextMarker.show(selectedGroup._wrapper, $.extend(coord, {
                                    width: 2 / selectedGroup._group.getCTM().a,
                                    height: lineHeight * 1.2,
                                    desx: desx
                                }));
                            }
                            if (selectedGroup._selectStartCoord) {
                                selectedGroup._drawMarking(selectedGroup._group, coord);
                            }
                            else if (!e.shiftKey) {
                                if ((e.keyCode >= 35 && e.keyCode <= 40) && !(e.ctrlKey || e.metaKey) || ((e.keyCode >= 35 && e.keyCode <= 36) && (e.ctrlKey || e.metaKey)) || ((e.keyCode >= 37 && e.keyCode <= 40) && e.metaKey)) {
                                    $('.marking').remove();
                                    selectedGroup._selection = null;
                                } else {
                                    SVGTextMarker.hide();
                                }
                            }
                        }
                    }
                });
                $(window).bind('keyup.' + this.name, function (e) {
                    var selectedGroup = SVGSelectableGElement.selectedGroup();
                    if (e.which == 16) {
                        selectedGroup._selectStartCoord = null;
                    }
                });
                $("svg").disableSelection();
                this.once = true;
            }
        }
    });
    $.extend(SVGEditableTextBox.prototype, {
        _text: '',
        _textPosition: 0,
        _selectStartCoord: null,
        _selection: null,
        _selectionDisabled: false,
        _tplClickState: false,
        _keepDesiredX: false,
        _moveDown: true,
        _renderTimer: -1,
        _contextMenu: false,
        _classType: "textbox",
        _size: {width: 0, height: 0},
        g: null,
        _history: [{}],
        _historyPos: 0,
        _historyAdd: function (val, textPosition) {
            if (!this._history[this._historyPos + 1] || (this._history[this._historyPos + 1] && val.length != this._history[this._historyPos + 1].length)) {
                this._history = this._history.slice(this._historyPos, this._historyPos + 100);
                this._historyPos = 0;
                this._history.unshift({text: val, textPosition: textPosition});
            }
            return val;
        },
        _historyUndo: function () {
            this._historyPos = Math.min(this._historyPos + 1, this._history.length - 1);
            if (this._history.length > -1) {
                this._text = this._history[this._historyPos].text;
                this._textPosition = this._history[this._historyPos].textPosition || this._textPosition;
            }
            this.update();
            return this._text;
        },
        _historyRedo: function () {
            this._historyPos = Math.max(this._historyPos - 1, 0);
            this._text = this._history[this._historyPos].text;
            this._textPosition = this._history[this._historyPos].textPosition || this._textPosition;
            this.update();
            return this._text;
        },
        _setText: function (text, textPosition) {
            this._historyAdd(text, textPosition);
            var res = this._preProcessSetText(text, textPosition);
            this._text = res[0];
            this._textPosition = res[1];
        },
        init: function (parent, value, width, height, settings) {
            this._parent = parent;
            this._text = this._preProcessSetText(value.toString(), 0)[0];
            this._history = [{text: value.toString(), textPosition: null}];
            this._width = width;
            this._height = height;
            SVGEditableTextBox._textareaCount++;
            this._id = (settings.id || 'textarea-' + SVGEditableTextBox._textareaCount.toString());
            this._class += " " + this._classType + " " + (settings.class || '');
            this._settings = settings;
            this._textPositions = [];
            SVGEditableTextBox.setup();
            this.super.init.apply(this);
            return this._render();
        },
        editable: function () {
        },
        destroy: function () {
            $(window).unbind('keydown.editable-textbox');
            this.super.destroy.apply(this);
        },
        getHeight: function () {
            return this._size['height'];
        },
        getWidth: function () {
            return this._size['width'];
        },
        openContextMenu: function (g, e) {
            var mouse = {x: e.clientX, y: e.clientY}, within = false;
            $('.marking').each(function (i, el) {
                var pos = $(el).position();
                var bbox = el.getBBox(), width = bbox.width, height = bbox.height;
                if (pos.left < mouse.x && pos.top < mouse.y && pos.left + width > mouse.x && pos.top + height > mouse.y) {
                    within = true;
                }
            });
            if (within) {
                this.openMarkingContextMenu();
            }
            else {
                this._selection = null;
                $('.marking').remove();
                this.openSelectionContextMenu();
            }
        },
        closeContextMenu: function () {
            this._contextMenu = false;
            var newt = (this._group.getAttribute('class') || '').replace('contextmenu', '').trim();
            this._group.setAttribute('class', newt);
        },
        openMarkingContextMenu: function () {
        },
        openSelectionContextMenu: function () {
        },
        stopEditing: function (all) {
            if (this._selection && !all) {
                $('.marking').remove();
                this._selection = null;
            }
            else if (SVGTextMarker.isVisible() && !all) {
                SVGTextMarker.hide();
                unselect_marker = true;
            }
            else {
                $('.marking').remove();
                this._selection = null;
                SVGTextMarker.hide();
                unselect_marker = true;
            }
        },
        getSelectedText: function () {
            var txt;
            if (this._selection) {
                p1 = this._getTextCharPosition(this._selection.start);
                p2 = this._getTextCharPosition(this._selection.stop);
                txt = this._text.substring(Math.min(p1, p2), Math.max(p1, p2));
            }
            return txt;
        },
        removeSelection: function () {
            if (this._selection) {
                p1 = this._getTextCharPosition(this._selection.start);
                p2 = this._getTextCharPosition(this._selection.stop);
                this._text = this._text.substring(0, Math.min(p1, p2)) + this._text.substring(Math.max(p1, p2), this._text.length);
                this._selection = null;
                this._textPosition = Math.min(p1, p2);
                this.update();
            }
        },
        disableSelection: function () {
            this.stopEditing(true);
            this._selectionDisabled = true;
        },
        enableSelection: function () {
            this._selectionDisabled = false;
        },
        update: function () {
            var self = this;
            clearTimeout(this._renderTimer);
            this._renderTimer = setTimeout(function () {
                self._render()
            }, 0);
        },
        _getGPadding: function (g) {
            var padding = {
                'top': num(StyleSheet.get('rect.background', 'padding-top', g)) * 1.2,
                'right': num(StyleSheet.get('rect.background', 'padding-right', g)),
                'bottom': num(StyleSheet.get('rect.background', 'padding-bottom', g)),
                'left': num(StyleSheet.get('rect.background', 'padding-left', g))
            }
            return padding;
        },
        _preProcessSetText: function (text, textPosition) {
            return [text, textPosition];
        },
        _postParagraphHook: function (group, text) {
            return true;
        },
        _render: function () {
            var that = this;
            var x = this._settings.x;
            var y = this._settings.y;
            var gSettings = {class: this._class, transform: 'translate(' + x + ',' + y + ')'};
            var g = this.super._render.call(this, this._parent, this._id, gSettings);
            if (g) {
                var padding = this._getGPadding(g);
                var maxWidth = this._width - padding['left'] - padding['right'];
                var textY = padding['top'];
                var tspanDy = num(StyleSheet.get('text', 'line-height', g));
                var tspanSettings = {'dy': num(tspanDy), 'x': 0, 'dx': num(padding['left']),};
                var textSettings = {'style': StyleSheet.getAllStyles('text', g)};
                if (this._settings.clipPath) {
                    textSettings['clip-path'] = this._settings.clipPath;
                }
                var paragraphCount = [];
                var rowCount = [];
                var lastRow = 0;
                var tspans;
                var paragraphs = [];
                var regex = /(([^\n]+)?[\n])|([^\n]+$)/g;
                while ((w = regex.exec(this._text)) != null) {
                    paragraphs.push(w[0]);
                }
                if (paragraphs.length == 0) {
                    paragraphs = [''];
                }
                var lastParagraphLength = paragraphs[paragraphs.length - 1].length;
                if (paragraphs[paragraphs.length - 1].charAt(lastParagraphLength - 1) == "\n") {
                    paragraphs.push("\u00A0");
                }
                testText = this._wrapper.createText();
                testText.span("test", tspanSettings);
                var style = $(tmp = that._wrapper.text(-1000, -1000, testText, textSettings))[0].style;
                fontSettings = style.fontFamily + ','
                    + style.fontSize + ','
                    + style.fontWeight + ','
                    + style.fontStretch + ','
                    + style.fontStyle + ','
                    + style.fontVariant + ','
                    + style.letterSpacing;
                $(tmp).remove();
                if (!(fontSettings in SVGEditableTextBox._wordCache)) {
                    SVGEditableTextBox._wordCache[fontSettings] = {};
                }
                $.each(paragraphs, function (i, paragraph) {
                    rowCount = [];
                    if (el = $(g).find("text").last()[0]) {
                        textY = num(el.getAttribute('y'));
                        var height = el.getBoundingClientRect().height;
                        textY += (height / el.getCTM().d);
                        if ($.browser.mozilla) {
                            textY += num(StyleSheet.get('text', 'padding-bottom', g)) * 1.4;
                        }
                    }
                    tspans = that._wrapper.createText();
                    var sections = [];
                    var regex = /(([^\r]+)?\r)|([^\r]+$)/g;
                    while ((w = regex.exec(paragraph)) != null) {
                        sections.push(w[0].replace("\r", "\u00A0"));
                    }
                    if (sections.length == 0 || (sections.length == 1 && sections[0] == "\n")) {
                        sections = ["\u00A0"];
                    }
                    var lastSectionLength = sections[sections.length - 1].length;
                    if (sections[sections.length - 1].charAt(lastSectionLength - 1) == "\r") {
                        sections.push("\u00A0");
                    }
                    $.each(sections, function (j, section) {
                        var regex = /\r|[ \u00A0]{1}|[^ \u00A0]+/g;
                        var remainingWords = [];
                        while ((w = regex.exec(section)) != null) {
                            remainingWords.push(w[0]);
                        }
                        var tmpRow = '';
                        var tmpText;
                        var tmpRowWidth = 0;
                        while (remainingWords[0]) {
                            cachedWord = SVGEditableTextBox._wordCache[fontSettings][remainingWords[0]];
                            if (cachedWord === undefined) {
                                tmpTspans = that._wrapper.createText();
                                tmpTspans.span("\u00A0" + remainingWords[0] + "\u00A0", tspanSettings);
                                tmpText = that._wrapper.text(-1000, -1000, tmpTspans, textSettings);
                                wrapperTspans = that._wrapper.createText();
                                wrapperTspans.span("\u00A0\u00A0", tspanSettings);
                                wrapperText = that._wrapper.text(-1000, -1000, wrapperTspans, textSettings);
                                cachedWord = SVGEditableTextBox._wordCache[fontSettings][remainingWords[0]] = {width: tmpText.width() - wrapperText.width(),};
                                $(tmpText).remove();
                                $(wrapperText).remove();
                            }
                            wordWidth = cachedWord.width;
                            if ((tmpRowWidth + wordWidth) <= maxWidth || maxWidth == -1) {
                                var word = remainingWords.shift();
                                tmpRow = tmpRow + word;
                                tmpRowWidth += wordWidth;
                            }
                            else {
                                if (tmpRow == '') {
                                    var tmpWord = '';
                                    var remainingChars = remainingWords[0].split("");
                                    while (remainingChars[0]) {
                                        newTmpWord = tmpWord + remainingChars[0];
                                        cachedWord = SVGEditableTextBox._wordCache[fontSettings][newTmpWord];
                                        if (cachedWord === undefined) {
                                            tmpTspans = that._wrapper.createText();
                                            tmpTspans.span(newTmpWord.replace(/ /g, "\u00A0"), tspanSettings);
                                            tmpText = that._wrapper.text(-1000, -1000, tmpTspans);
                                            cachedWord = SVGEditableTextBox._wordCache[fontSettings][newTmpWord] = {
                                                width: tmpText.width()
                                                + padding['left']
                                                + padding['right'],
                                            };
                                        }
                                        if (cachedWord.width <= maxWidth) {
                                            tmpWord += remainingChars.shift();
                                            wordWidth = cachedWord.width;
                                        }
                                        else {
                                            if (tmpWord.length == 0) {
                                                tmpWord += remainingChars.shift();
                                            }
                                            el = tspans.span(tmpWord.replace(/ /g, "\u00A0"), tspanSettings);
                                            rowCount.push(lastRow);
                                            lastRow += tmpWord.length;
                                            tmpWord = '';
                                            wordWidth = 0;
                                        }
                                        $(tmpText).remove();
                                    }
                                    remainingWords.shift();
                                    if (tmpWord !== '') {
                                        remainingWords.unshift(tmpWord);
                                    }
                                }
                                else {
                                    if (!/[ \u00A0]{1}$/.test(tmpRow) && /^[ \u00A0]{1}$/.test(remainingWords[0])) {
                                        tmpRow += remainingWords.shift();
                                    }
                                    tspans.span(tmpRow.replace(/ /g, "\u00A0"), tspanSettings);
                                    rowCount.push(lastRow);
                                    lastRow += tmpRow.length;
                                    tmpRow = '';
                                    tmpRowWidth = 0;
                                }
                            }
                        }
                        tspans.span(tmpRow.replace(/ /g, "\u00A0"), tspanSettings);
                        rowCount.push(lastRow);
                        lastRow += tmpRow.length;
                    });
                    paragraphCount.push(rowCount);
                    t = that._wrapper.text(g, 0, num(textY), tspans, textSettings);
                    that._postParagraphHook(g, t);
                });
                var lineHeight = num(StyleSheet.get('text', 'line-height', g));
                var width = num(maxWidth) + padding['right'] + padding['left'];
                var height = g.height() + num(padding['bottom']) +
                    g.firstChild.getBBox().y;
                var bgRect = that._wrapper.rect(g, 0, 0, width, height, {class: 'background'});
                g.insertBefore(bgRect, g.firstChild);
                g.reload();
                this._textPositions = paragraphCount;
                if (g._selected && !this._selectionDisabled) {
                    var possi = this._getTextPosition(this._textPosition);
                    var coord = this._getCoordInTextbox(g, possi.paragraph + 1, possi.row + 1, possi.char);
                    var desx = (this._keepDesiredX ? SVGTextMarker.getDesiredX() : coord.x);
                    SVGTextMarker.show(this._wrapper, $.extend(coord, {
                        width: 2 / g.getCTM().a,
                        height: lineHeight * 1.2,
                        desx: desx
                    }));
                }
                var eChange = $.Event("change", {target: g});
                var eChangeSize = $.Event("changeSize", {target: g});
                this.trigger(eChange, [this._text]);
                if (this._size.width != width || this._size.height != height) {
                    this._size.width = width;
                    this._size.height = height;
                    this.trigger(eChangeSize, [width, height]);
                }
            }
            return this;
        },
        _coordInText: function (g, e, no_space_end) {
            var row = e.target, nearestDist = 999999, nearestEl, paragraphIndex = 0, rowIndex = 0, lineHeight = num(StyleSheet.get('text', 'line-height', g));
            var mouse = {x: e.clientX, y: e.clientY};
            if (g && e.target.constructor !== SVGTSpanElement) {
                row = null;
                $.each(g.getElementsByTagName('text'), function (i, e) {
                    $.each(e.getElementsByTagName('tspan'), function (i2, e2) {
                        var temp = e2.position();
                        dist = Math.sqrt(Math.pow(temp.left - mouse.x, 2) + Math.pow(temp.top - mouse.y, 2));
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestEl = e2;
                            paragraphIndex = i;
                            rowIndex = i2;
                        }
                    });
                });
                row = nearestEl;
            } else {
                if (e.target.parentNode) {
                    $.each(e.target.parentNode.parentNode.getElementsByTagName('text'), function (i, el) {
                        $.each(el.childNodes, function (i2, el2) {
                            if (el2 == row) {
                                paragraphIndex = i;
                                rowIndex = i2;
                            }
                        });
                    });
                }
            }
            if (row && row.firstChild) {
                var pos = row.position();
                var stopNext = false, prevLen = pos.x, leftPos = pos.x, rightPos, i = 0, closestPos = 0, pattern = (no_space_end ? /\r|\n|\s+$/ : /\r|\n/);
                var rowLen = row.firstChild.data.replace(pattern, '').length
                for (i; i <= rowLen; i++) {
                    var len = row.getSubStringLength(0, i);
                    if ($.browser.mozilla) {
                        len = Math.max(0, Math.ceil(len - 8));
                    }
                    charPos = len * g.getScreenCTM().a + pos.left;
                    if (stopNext) {
                        rightPos = prevLen;
                        charIndex = i;
                        break;
                    }
                    if (charPos > mouse.x) {
                        stopNext = true;
                        leftPos = prevLen;
                    }
                    prevLen = charPos;
                }
                if (!rightPos)rightPos = prevLen;
                if (mouse.x - leftPos < rightPos - mouse.x) {
                    closestPos = leftPos;
                    i--;
                }
                else {
                    closestPos = rightPos;
                }
                var screenCTM = g.getScreenCTM();
                return {
                    parent: g,
                    element: row,
                    x: Math.round((closestPos - screenCTM.e) / screenCTM.a),
                    y: Math.round((pos.top - screenCTM.f) / screenCTM.d) - lineHeight,
                    paragraph: paragraphIndex + 1,
                    row: rowIndex + 1,
                    char: i - 1
                };
            }
            return null;
        },
        _getClosestRowCoordsInText: function (g, e) {
            var pos = this._coordInText(g, e);
            if (pos) {
                return {
                    parent: g,
                    element: pos.element,
                    x: pos.x,
                    y: pos.y,
                    paragraph: pos.paragraph,
                    row: pos.row,
                    char: pos.char
                };
            }
            return null;
        },
        _getWordCoordsInText: function (g, e) {
            var pos = this._coordInText(g, e);
            if (pos) {
                var str = pos.element.firstChild.data;
                if (str[pos.char] != '\u00A0') {
                    for (var i = Math.max(pos.char - 1, 0); i >= 0; i--) {
                        if (str[i] == '\u00A0' && i < str.length - 1) {
                            i = i + 1;
                            break;
                        }
                        else if (i <= 0) {
                            i = 0;
                            break;
                        }
                    }
                    for (var j = Math.min(pos.char + 1, str.length); j < str.length; j++) {
                        if (j >= str.length) {
                            j = str.length;
                            break;
                        }
                        else if (str[j] == '\u00A0') {
                            break;
                        }
                    }
                } else {
                    for (var i = Math.max(pos.char - 1, 0); i >= 0; i--) {
                        if (str[i] != '\u00A0' && i < str.length - 1) {
                            i = i + 1;
                            break;
                        }
                        else if (i <= 0) {
                            i = 0;
                            break;
                        }
                    }
                    for (var j = Math.min(pos.char + 1, str.length); j < str.length; j++) {
                        if (j >= str.length) {
                            j = str.length;
                            break;
                        }
                        else if (str[j] != '\u00A0') {
                            break;
                        }
                    }
                }
                var len1 = pos.element.getSubStringLength(i, pos.char - i);
                var len2 = pos.element.getSubStringLength(pos.char - (pos.char < str.length ? 0 : 1), j - pos.char);
                if ($.browser.mozilla) {
                    if (i == 0) {
                        len1 = Math.max(0, Math.ceil(len1 - 8));
                        if (len1 == 0)
                            len2 = Math.max(0, Math.ceil(len2 - 8));
                    }
                    else {
                        len1 = Math.max(0, Math.floor(len1 + 1));
                    }
                    len2 = Math.max(0, Math.floor(len2));
                }
                return {
                    start: {parent: g, x: pos.x - len1, y: pos.y, paragraph: pos.paragraph, row: pos.row, char: i},
                    stop: {parent: g, x: pos.x + len2, y: pos.y, paragraph: pos.paragraph, row: pos.row, char: j}
                };
            }
            return null;
        },
        _getEndOfRowPosition: function (paragraph, row) {
            if ((c = this._textPositions[paragraph][row + 1]) !== undefined) {
            }
            else if (this._textPositions[paragraph + 1] !== undefined && (c = this._textPositions[paragraph + 1][0]) !== undefined) {
            }
            else {
                c = this._text.length + 1;
            }
            c--;
            return c;
        },
        _getTextCharPosition: function (coord) {
            return this._textPositions[coord.paragraph - 1][coord.row - 1] + coord.char;
        },
        _getTextPosition: function (pos) {
            if (pos <= 0) {
                return {paragraph: 0, row: 0, char: 0}
            }
            else if (pos > this._text.length) {
                paragraph = this._textPositions.length - 1;
                row = this._textPositions[paragraph].length - 1;
                return {paragraph: paragraph, row: row, char: this._text.length - this._textPositions[paragraph][row]}
            }
            row = 0;
            paragraph = 0;
            done = false;
            while (this._textPositions[paragraph] !== undefined) {
                while (this._textPositions[paragraph][row] !== undefined) {
                    if (this._textPositions[paragraph][row] < pos) {
                        result = {paragraph: paragraph, row: row, char: pos - this._textPositions[paragraph][row]}
                    }
                    else if (this._textPositions[paragraph][row] == pos) {
                        return {paragraph: paragraph, row: row, char: pos - this._textPositions[paragraph][row]};
                    }
                    else if (this._textPositions[paragraph][row] > pos) {
                        return result;
                    }
                    row++;
                }
                paragraph++;
                row = 0;
            }
            return result;
        },
        _getCoordInTextbox: function (g, paragraph, row, char) {
            if (g !== undefined && g !== null) {
                var pEl = g.getElementsByTagName('text')[paragraph - 1];
                if (pEl) {
                    var rEl = pEl.getElementsByTagName('tspan')[row - 1];
                    if (rEl && rEl.firstChild) {
                        var len;
                        if (rEl.firstChild.data.length >= char && char > 0) {
                            len = rEl.getSubStringLength(0, char);
                        }
                        else if (char == 0) {
                            len = 0;
                        }
                        else {
                            len = rEl.getComputedTextLength();
                        }
                        var screenCTM = g.getScreenCTM();
                        var lineHeight = num(StyleSheet.get('text', 'line-height', g));
                        if ($.browser.mozilla) {
                            len = Math.max(0, Math.ceil(len - 8));
                        }
                        var pos = rEl.position();
                        charPos = len * screenCTM.a + pos.left;
                        return {
                            parent: g,
                            element: row,
                            x: Math.round((charPos - screenCTM.e) / screenCTM.a),
                            y: Math.round((pos.top - screenCTM.f) / screenCTM.d) - lineHeight,
                            paragraph: paragraph,
                            row: row,
                            char: char
                        };
                    }
                }
            }
            return null;
        },
        _getCoordInRowNearX: function (g, paragraph, row, x) {
            if (g) {
                var pEl = g.getElementsByTagName('text')[paragraph - 1];
                if (pEl) {
                    var rEl = pEl.getElementsByTagName('tspan')[row - 1];
                    if (rEl && rEl.firstChild) {
                        var pos = rEl.position();
                        var stopNext = false, prevLen = pos.x, leftPos = pos.x, rightPos, i = 0, x = x + g.position().left, closestPos = 0, screenCTM = g.getScreenCTM(), lineHeight = num(StyleSheet.get('text', 'line-height', g));
                        for (i; i <= rEl.firstChild.data.length; i++) {
                            var len = rEl.getSubStringLength(0, i);
                            if ($.browser.mozilla) {
                                len = Math.max(0, Math.ceil(len - 8));
                            }
                            charPos = len * g.getScreenCTM().a + pos.left;
                            if (stopNext) {
                                rightPos = prevLen;
                                charIndex = i;
                                break;
                            }
                            if (charPos > x) {
                                stopNext = true;
                                leftPos = prevLen;
                            }
                            prevLen = charPos;
                        }
                        if (!rightPos)rightPos = prevLen;
                        if (x - leftPos < rightPos - x) {
                            closestPos = leftPos;
                            i--;
                        }
                        else {
                            closestPos = rightPos;
                        }
                        return {
                            parent: g,
                            element: rEl,
                            x: Math.round((closestPos - screenCTM.e) / screenCTM.a),
                            y: Math.round((pos.top - screenCTM.f) / screenCTM.d) - lineHeight,
                            paragraph: paragraph - 1,
                            row: row - 1,
                            char: i - 1
                        };
                    }
                }
            }
            return null;
        },
        _drawWordMarking: function (g, e) {
            var coords = this._getWordCoordsInText(g, e), width = coords.stop.x - coords.start.x, height = num(StyleSheet.get('text', 'line-height', g));
            var marking = this._wrapper.rect(coords.stop.parent, coords.start.x, coords.start.y, width, height * 1.2, {class: 'marking'});
            marking.parentNode.insertBefore(marking, marking.parentNode.firstChild.nextSibling);
            this._selection = coords;
        },
        _drawRowMarking: function (g, e) {
            var coords = this._coordInText(g, e), pos = coords.element.offset(), width = coords.element.width(), height = coords.element.height();
            var marking = this._wrapper.rect(coords.parent, pos.left, pos.top - height, width, height * 1.2, {class: 'marking'});
            marking.parentNode.insertBefore(marking, marking.parentNode.firstChild.nextSibling);
            this._selection = {
                start: {
                    parent: g,
                    element: coords.element,
                    x: pos.left,
                    y: pos.top - height,
                    paragraph: coords.paragraph,
                    row: coords.row,
                    char: 0
                },
                stop: {
                    parent: g,
                    element: coords.element,
                    x: pos.left + width,
                    y: pos.top - height,
                    paragraph: coords.paragraph,
                    row: coords.row,
                    char: coords.element.firstChild.data.length - 1
                }
            };
        },
        _drawMarking: function (g, e_or_pos) {
            var lineHeight = num(StyleSheet.get('text', 'line-height', g));
            if (this._selectStartCoord != null) {
                var selectStopCoord;
                $('.marking').remove();
                if (g && g._selectable && g._selectable.selected) {
                    if (e_or_pos.clientX !== undefined)
                        selectStopCoord = this._coordInText(g, e_or_pos); else
                        selectStopCoord = e_or_pos;
                }
                else {
                    var nearGroup = SVGSelectableGElement.selectedGroup();
                    selectStopCoord = this._getClosestRowCoordsInText(nearGroup._group, e_or_pos);
                }
                var minX = Math.min(this._selectStartCoord.x, selectStopCoord.x), minY = Math.min(this._selectStartCoord.y, selectStopCoord.y), maxX = Math.max(this._selectStartCoord.x, selectStopCoord.x), maxY = Math.max(this._selectStartCoord.y, selectStopCoord.y);
                if (isNumber(minX) && isNumber(minY) && isNumber(maxX) && isNumber(maxY)) {
                    if (this._selectStartCoord.row + '.' + this._selectStartCoord.paragraph
                        != selectStopCoord.row + '.' + selectStopCoord.paragraph) {
                        var that = this;
                        var p = 1;
                        $.each(selectStopCoord.parent.getElementsByTagName('text'), function (i, el) {
                            var r = 1;
                            $.each(el.childNodes, function (i2, el2) {
                                var minRow, maxRow, x1 = that._selectStartCoord.x, x2 = selectStopCoord.x, pos;
                                if (that._selectStartCoord.paragraph > selectStopCoord.paragraph) {
                                    minRow = {p: selectStopCoord.paragraph, r: selectStopCoord.row};
                                    maxRow = {p: that._selectStartCoord.paragraph, r: that._selectStartCoord.row};
                                    x1 = selectStopCoord.x;
                                    x2 = that._selectStartCoord.x;
                                }
                                else if (that._selectStartCoord.paragraph == selectStopCoord.paragraph) {
                                    minRow = {
                                        p: that._selectStartCoord.paragraph,
                                        r: Math.min(that._selectStartCoord.row, selectStopCoord.row)
                                    };
                                    maxRow = {
                                        p: that._selectStartCoord.paragraph,
                                        r: Math.max(that._selectStartCoord.row, selectStopCoord.row)
                                    };
                                    if (that._selectStartCoord.row > selectStopCoord.row) {
                                        x1 = selectStopCoord.x;
                                        x2 = that._selectStartCoord.x;
                                    }
                                }
                                else {
                                    minRow = {p: that._selectStartCoord.paragraph, r: that._selectStartCoord.row};
                                    maxRow = {p: selectStopCoord.paragraph, r: selectStopCoord.row};
                                }
                                var paint = false;
                                if (p == minRow.p && r == minRow.r) {
                                    pos = {left: x1, top: minY};
                                    width = el2.width() - pos.left + el2.offset().left;
                                    height = el2.height();
                                    paint = true;
                                }
                                else if ((p >= minRow.p && p <= maxRow.p) && ((r > minRow.r && p == minRow.p && p < maxRow.p) || (p > minRow.p && p < maxRow.p && minRow.p != maxRow.p) || (minRow.p == maxRow.p && r > minRow.r && r < maxRow.r) || (r < maxRow.r && p == maxRow.p && p > minRow.p))) {
                                    pos = el2.offset(), width = el2.width(), height = el2.height();
                                    pos.top -= lineHeight;
                                    paint = true;
                                }
                                else if (p == maxRow.p && r == maxRow.r) {
                                    pos = el2.offset();
                                    width = x2 - pos.left;
                                    height = el2.height();
                                    pos.top -= lineHeight;
                                    paint = true;
                                }
                                if (pos != null && typeof(pos) != 'undefined' && paint) {
                                    var marking = that._wrapper.rect(selectStopCoord.parent, pos.left, pos.top + ($.browser.mozilla ? 2 : 0), width, height * ($.browser.mozilla ? 1 : 1.2), {class: 'marking'});
                                    marking.parentNode.insertBefore(marking, marking.parentNode.firstChild.nextSibling);
                                }
                                r++;
                            });
                            p++;
                        });
                    }
                    else {
                        var marking = this._wrapper.rect(this._selectStartCoord.parent, minX, minY + ($.browser.mozilla ? 1 : 0), maxX - minX, maxY - minY + lineHeight * ($.browser.mozilla ? 1.1 : 1.2), {class: 'marking'});
                        marking.parentNode.insertBefore(marking, marking.parentNode.firstChild.nextSibling);
                    }
                    this._selection = {start: this._selectStartCoord, stop: selectStopCoord};
                    SVGTextMarker.hide();
                } else {
                    $('.marking').remove();
                }
            }
        },
        select: function (g, e) {
        },
        deselect: function () {
            SVGTextMarker.hide();
            $('.marking').remove();
        },
        mouseup: function (g, e) {
            this._selectStartCoord = null;
        },
        mousedown: function (g, e) {
            var image = (g) && (-1 != $.inArray("image", g.getAttribute("class").split(" ")));
            if (g && g._selectable && g._selectable.selected && !image) {
                if (e.button != 2) {
                    this.closeContextMenu();
                    var dclicktime = $(window).data('dclickstime');
                    var diff = new Date().getTime() - dclicktime;
                    if (!diff || (diff > 300 || this._selection) && !this._tplClickState) {
                        if (this._selection) {
                            this._selection = null;
                            $('.marking').remove();
                        }
                        var lineHeight = num(StyleSheet.get('text', 'line-height', g));
                        var coord = this._coordInText(g, e, true);
                        if (!this._selectionDisabled) {
                            SVGTextMarker.show(this._wrapper, $.extend(coord, {
                                width: 2 / g.getCTM().a,
                                height: lineHeight * 1.2,
                                desx: coord.x
                            }));
                        }
                        row = coord.row - 1;
                        paragraph = coord.paragraph - 1;
                        this._textPosition = this._textPositions[paragraph][row] + coord.char;
                        this._selectStartCoord = this._coordInText(g, e);
                    }
                    else if (this._tplClickState) {
                        this._tplClickState = false;
                    }
                }
            }
        },
        mousemove: function (g, e) {
            if (this._selectStartCoord) {
                var screenCTM = this._selectStartCoord.parent.getScreenCTM();
                var lineHeight = num(StyleSheet.get('text', 'line-height', g));
                var dx = Math.abs((this._selectStartCoord.x) * screenCTM.a + screenCTM.e - e.clientX), dy = Math.abs((this._selectStartCoord.y + lineHeight) * screenCTM.d + screenCTM.f - e.clientY);
                var delta = Math.sqrt(Math.pow(dx, 2)
                    + Math.pow(dy, 2));
                if ((dy > lineHeight || dx > 3)) {
                    if (SVGTextMarker.isVisible()) {
                        SVGTextMarker.hide();
                    }
                    if (!this._selectionDisabled)
                        this._drawMarking(g, e);
                }
                else if (!this._selectionDisabled) {
                    SVGTextMarker.show(this._wrapper, $.extend(this._selectStartCoord, {
                        width: 2 / g.getCTM().a,
                        height: lineHeight * 1.2,
                        desx: this._selectStartCoord.x
                    }));
                    $('.marking').remove();
                    this._selection = null;
                }
            }
            else if (!this._selectionDisabled) {
                this._drawMarking(g, e);
            }
        },
        click: function (g, e) {
            var lineHeight = num(StyleSheet.get('text', 'line-height', g));
            var dclicktime = $(window).data('dclickstime');
            if ((new Date().getTime() - dclicktime < 300 || this._selection == null) && !this._tplClickState) {
            } else if (this._tplClickState) {
                this._tplClickState = false;
            }
        },
        dblclick: function (g, e) {
            if (g) {
                SVGTextMarker.hide();
                $('.marking').remove();
                this.closeContextMenu();
                if (!this._selectionDisabled)
                    this._drawWordMarking(g, e);
            }
        },
        tplclick: function (g, e) {
            SVGTextMarker.hide();
            $('.marking').remove();
            this._tplClickState = true;
            this.closeContextMenu();
            if (!this._selectionDisabled)
                this._drawRowMarking(g, e);
        },
        contextmenu: function (g, e) {
            e.preventDefault();
            this._contextMenu = true;
            g.setAttribute('class', g.getAttribute('class')
                + (/contextmenu/.test(g.getAttribute('class')) ? '' : ' contextmenu'));
            this.openContextMenu(g, e);
        }
    });
    function SVGEditableList(wrapper) {
        this._wrapper = wrapper;
    }

    $.extend(SVGEditableList.prototype, new SVGEditableTextBox);
    $.extend(SVGEditableList.prototype, {
        _classType: "list", _getGPadding: function (g) {
            var padding = {};
            padding['top'] = num(StyleSheet.get('rect.list', 'padding-top', g)) * 1.2;
            padding['right'] = num(StyleSheet.get('rect.list', 'padding-right', g));
            padding['bottom'] = num(StyleSheet.get('rect.list', 'padding-bottom', g));
            padding['left'] = num(StyleSheet.get('rect.list', 'padding-left', g)) + num(StyleSheet.get('text', "font-size", g)) * 2;
            return padding;
        }, _postParagraphHook: function (group, text) {
            var height = num(text.getAttribute("y"));
            var paddingLeft = num(StyleSheet.get("rect.list", "padding-left", group));
            var lineHeight = num(StyleSheet.get("text", "line-height", group));
            var fontSize = num(StyleSheet.get("text", "font-size", group));
            var radius = fontSize * 0.2;
            this._wrapper.circle(group, fontSize + paddingLeft, height + lineHeight - fontSize / 2 + radius / 2, radius);
            return true;
        },
    });
    function SVGEditableText(wrapper) {
        this._wrapper = wrapper;
    }

    $.extend(SVGEditableText.prototype, new SVGEditableTextBox);
    $.extend(SVGEditableText.prototype, {
        _classType: "text", _preProcessSetText: function (text, textPosition) {
            var before = text.length;
            text = text.replace(/[\n\r]{1}/g, "");
            var after = text.length;
            var diff = before - after;
            textPosition = textPosition - diff;
            return [text, textPosition];
        },
    });
    SVGTextMarker = {};
    $.extend(SVGTextMarker, {
        _wrapper: null,
        _marker: null,
        _visible: false,
        _blinkId: -1,
        _blinkState: true,
        _settings: {parent: null, x: 10, y: 10, width: 2, height: 12, paragraph: 0, row: 0, char: 0, desx: 0},
        show: function (wrapper, options) {
            this._visible = true;
            this._wrapper = wrapper;
            this._blinkState = false;
            this._settings = $.extend(this._settings, options);
            this._render();
        },
        hide: function () {
            this._visible = false;
            if (this._marker != null) {
                this._wrapper.remove(this._marker);
                delete this._marker;
            }
            clearTimeout(this._blinkId);
            this._blinkId = -1;
            this._blinkState = false;
        },
        getChar: function () {
            return this._settings.char;
        },
        getRow: function () {
            return this._settings.row;
        },
        getParagraph: function () {
            return this._settings.paragraph;
        },
        getDesiredX: function () {
            return this._settings.desx;
        },
        isVisible: function () {
            return this._visible;
        },
        _render: function () {
            if (this._marker) {
                $(this._marker).remove();
                delete this._marker;
            }
            if (this._visible && this._wrapper && !this._blinkState) {
                this._marker = this._wrapper.rect(this._settings.parent, this._settings.x, this._settings.y, this._settings.width, this._settings.height, {class: 'marker'});
            }
            this._blinkState = !this._blinkState;
            clearTimeout(this._blinkId);
            this._blinkId = setTimeout("SVGTextMarker._render()", 550);
        }
    });
    function SVGEditableImage(wrapper) {
        this._wrapper = wrapper;
    }

    SVGEditableImage.inheritsFrom(SVGSelectableGElement);
    $.extend(SVGEditableImage, {
        once: false, setup: function () {
            if (!this.once) {
                $(window).bind('keydown.' + this.name, function (e) {
                    var selectedGroup = SVGSelectableGElement.selectedGroup();
                    var self = this;
                    if (selectedGroup && selectedGroup.constructor === SVGEditableImage) {
                        if ((e.keyCode == 46 || e.keyCode == 8)) {
                            e.preventDefault();
                            selectedGroup._delete();
                        }
                    }
                });
                this.once = true;
            }
        }
    });
    $.extend(SVGEditableImage.prototype, {
        _classType: "image",
        _renderTimer: -1,
        _height: 0,
        _width: 0,
        init: function (parent, value, width, height, settings) {
            var self = this;
            this._parent = parent;
            this._src = value.toString();
            this._width = width;
            this._height = height;
            SVGEditableImage._textareaCount++;
            this._id = (settings.id || 'textarea-' + SVGEditableTextBox._textareaCount.toString());
            this._class += " " + this._classType + " " + (settings.class || '');
            var _settings = {buttonText: 'edit',};
            this._settings = $.extend(_settings, settings);
            SVGEditableImage.setup();
            this.super.init.apply(this);
            $(window).bind('resize', function () {
                self.update()
            });
            return this._render();
        },
        setValue: function (value) {
            this._src = value;
            this.update();
        },
        update: function () {
            var self = this;
            clearTimeout(this._renderTimer);
            this._renderTimer = setTimeout(function () {
                self._render()
            }, 0);
        },
        _render: function () {
            var self = this;
            var x = this._settings.x;
            var y = this._settings.y;
            var gSettings = {class: this._class, transform: 'translate(' + x + ',' + y + ')'};
            var g = this.super._render.call(this, this._parent, this._id, gSettings);
            var padding = this._getGPadding(g);
            var maxWidth = this._width - padding['left'] - padding['right'];
            var width = num(maxWidth);
            var ctm = g.getScreenCTM();
            var img = new Image();
            img.onload = function () {
                var imageProportion = this.width / this.height;
                var height = width / imageProportion;
                var img = self._wrapper.image(g, padding['left'], padding['top'], width, height, self._src);
                img.setAttribute('xlink:href', self._src);
                var f = self._wrapper.other(g, 'foreignObject', {
                    width: width * ctm.a,
                    height: 24,
                    x: 0,
                    y: 10,
                    transform: 'scale(' + (1 / ctm.a) + ')'
                });
                var it = $("<div class='imagetool'><button>" + self._settings.buttonText + "</button></div>");
                $(f).append(it);
                it.bind('click', function (e) {
                    self._group.select(e);
                    self.trigger(new $.Event("edit", {target: self._group}));
                });
                var bgRect = self._wrapper.rect(g, 0, 0, width + padding['right'] + padding['left'], height + padding['top'] + num(padding['bottom']), {class: 'background'});
                g.insertBefore(bgRect, g.firstChild);
                g.reload();
                var eChangeSize = $.Event("changeSize", {target: self._group});
                self.trigger(eChangeSize, [bgRect.getAttribute("width"), bgRect.getAttribute("height")]);
            }
            img.src = this._src;
            return this;
        },
        _getGPadding: function (g) {
            var padding = {
                'top': num(StyleSheet.get('rect.background', 'padding-top', g)) * 1.2,
                'right': num(StyleSheet.get('rect.background', 'padding-right', g)),
                'bottom': num(StyleSheet.get('rect.background', 'padding-bottom', g)),
                'left': num(StyleSheet.get('rect.background', 'padding-left', g))
            };
            return padding;
        },
        getHeight: function () {
            return this._height;
        },
        getWidth: function () {
            return this._width;
        },
        disableSelection: function () {
        },
        enableSelection: function () {
        },
        select: function (g, e) {
        },
        deselect: function () {
        },
        mouseup: function (g, e) {
        },
        mousedown: function (g, e) {
        },
        mousemove: function (g, e) {
        },
        click: function (g, e) {
        },
        dblclick: function (g, e) {
        },
        tplclick: function (g, e) {
        },
        contextmenu: function (g, e) {
        }
    });
})(jQuery);