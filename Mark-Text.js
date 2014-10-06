/**
 * @fileoverview    Mark/unmark selected text (and persist marked text)
 * @author          Nathan Rijksen
 * @version         1.0
 */

if (typeof(extensions) === 'undefined')
    extensions = {};
if ( ! extensions.MarkSelection) {
    extensions.MarkSelection = {};
}
else
{
    var editor_pane = ko.views.manager.topView;
    editor_pane.removeEventListener('keypress', extensions.MarkSelection.onKeyPress, true);
}

(function() {

    var log     = ko.logging.getLogger("ext_markselect");
    var editor  = ko.views.manager.currentView.scimoz;
    var self    = this;

    this.init = function()
    {
        if ( ! this.prepare()) return;

        var indicators = this.getFileIndicators();
        for (let i in indicators)
        {
            this.addIndicator(indicators[i]);
        }

        var editor_pane = ko.views.manager.topView;
        editor_pane.addEventListener('keypress', this.onKeyPress, true);
    }

    this.prepare = function()
    {
        if ( ! editor) return false;

        var color = ko.prefs.getLong('ext_marksel_color',
                                     require("ko/color").RGBToBGR("#FF0000"));

        editor.indicSetStyle(30, editor.INDIC_STRAIGHTBOX);
        editor.indicSetFore(30, color);
        editor.indicSetAlpha(30, 100);
        editor.indicSetUnder(30, false);
        editor.indicatorCurrent = 30;
        editor.indicatorValue = 1;

        return true;
    }

    this.onKeyPress = function(e)
    {
        if (e.charCode != 109 || ! e.altKey || ! self.prepare()) return;

        var start = editor.anchor;
        var end = editor.currentPos;
        if (editor.anchor > editor.currentPos)
        {
            start = editor.currentPos;
            end = editor.anchor;
        }
        var range = {start: start, length: end - start, stop: end};

        if (editor.indicatorValueAt(30, range.start) == 1)
        {
            self.removeIndicator(range);
        }
        else
        {
            self.addIndicator(range);
        }
    };

    this.getFileIndicators = function()
    {
        var pref = ko.views.manager.currentView.prefs;
        return pref.hasPrefHere('ext_marksel_indicators') ?
                            JSON.parse(pref.getString('ext_marksel_indicators')) :
                            [];
    }

    this.saveFileIndicators = function(indicators)
    {
        var pref = ko.views.manager.currentView.prefs;
        pref.setString('ext_marksel_indicators', JSON.stringify(indicators));
    }

    this.addIndicator = function(range)
    {
        var indicators = self.getFileIndicators();
        indicators.push(range)
        self.saveFileIndicators(indicators);
        editor.indicatorFillRange(range.start, range.length);
    }

    this.removeIndicator = function(range)
    {
        var cleared = false;
        var newIndicators = [];
        var indicators = this.getFileIndicators();
        for (let i in indicators)
        {
            let _range = indicators[i];
            if (range.start >= _range.start && range.start < _range.stop)
            {
                editor.indicatorClearRange(_range.start, _range.length);
            }
            else
            {
                newIndicators.push(_range);
            }
        }

        self.saveFileIndicators(newIndicators);
        editor.indicatorClearRange(range.start, range.length);
    }

    this.init();

}).apply(extensions.MarkSelection);
