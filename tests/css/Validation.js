(function(){

    var Assert = YUITest.Assert,
        Parser = parserlib.css.Parser;

    //-------------------------------------------------------------------------
    // New testcase type to make it easier to test patterns
    //-------------------------------------------------------------------------

    function ValidationTestCase(info){
        var i, len, prop, msg;

        YUITest.TestCase.call(this, info);
        this.valid = info.valid;
        this.invalid = info.invalid;
        this.property = info.property;
        this.name = "Tests for " + this.property;
        this._should.error = {};

        for (i=0, len=this.valid.length; i < len; i++){
            this["'" + this.valid[i] + "' is a valid value for '" + this.property + "'"] = function(value){
                return function(){
                    this._testValidValue(value);
                };
            }(this.valid[i]);
        }

        for (prop in this.invalid){
            if (this.invalid.hasOwnProperty(prop)){
                this["'" + prop + "' is an invalid value for '" + this.property + "'"] = function(value, message){
                    return function(){
                        this._testInvalidValue(value, message);
                    };
                }(prop, this.invalid[prop]);
            }
        }

        for (prop in this.error){
            if (this.error.hasOwnProperty(prop)){
                msg = "'" + prop + "' is an invalid value for '" + this.property + "'";
                this[msg] = function(value){
                    return function(){
                        this._testSyntaxError(value);
                    };
                }(prop);
                this._should.error[msg] = this.error[prop];
            }
        }
    }

    ValidationTestCase.prototype = new YUITest.TestCase();

    ValidationTestCase.prototype._testValidValue = function(value){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNull(event.invalid);
        });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");
    };

    ValidationTestCase.prototype._testInvalidValue = function(value, message){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNotNull(event.invalid);
            Assert.areEqual(message, event.invalid.message);
        });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");
    };

    ValidationTestCase.prototype._testSyntaxError = function(value){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");
    };


    //-------------------------------------------------------------------------
    // Validation Tests
    //-------------------------------------------------------------------------

    var suite = new YUITest.TestSuite("Validation Tests");

    suite.add(new ValidationTestCase({
        property: "animation-fill-mode",

        valid: [
            "none",
            "forwards",
            "backwards",
            "both",
            "none, forwards"
        ],

        invalid: {
            "1px" : "Expected (none | forwards | backwards | both) but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-name",

        valid: [
            "none",
            "foo",
            "red",
            "-red",
            "-specific",
            "sliding-vertically",
            "test1",
            "test1, animation4",
            "foo, bar",
            "none, none",
            "none, foo",
            "has_underscore",
            "none, -moz-specific, sliding",
            "initial",
            "inherit",
            "unset"
        ],

        invalid: {
            "1px" : "Expected (none | initial | inherit | unset | <single-animation-name>) but found '1px'.",
            "--invalid" : "Expected (none | initial | inherit | unset | <single-animation-name>) but found '--invalid'."
        },

        error: {
            "-0num": "Unexpected token '0num' at line 1, col 24."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-duration",

        valid: [
            "1s",
            "1s, 1s"
        ],

        invalid: {
            "0" : "Expected (<time>) but found '0'.",
            "1px" : "Expected (<time>) but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "azimuth",

        valid: [
            "behind",
            "250deg",
            "far-right behind",
            "behind far-right",
            "rightwards",
            "leftwards"
        ],

        invalid: {
            "behind behind" : "Expected end of value but found 'behind'.",
            "foo" : "Expected (<'azimuth'>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-attachment",

        valid: [
            "scroll",
            "fixed",
            "local"
        ],

        invalid: {
            "foo" : "Expected (<attachment>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent",
            "currentColor"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-image",

        valid: [
            "none",
            "url(foo.png)",
            "url(foo.png), none",
            "url(foo.png), url(bar.png)",
            "linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "radial-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "repeating-linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "repeating-radial-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "-ms-linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%), url(foo.png)",
            "-webkit-gradient(linear, left bottom, left top, from(#f2f2f2), to(#cbcbcb))"
        ],

        invalid: {
            "foo" : "Expected (<bg-image>) but found 'foo'.",
            "url(foo.png)," : "Expected end of value but found ','."
        }
    }));


    suite.add(new ValidationTestCase({
        property: "background-position",

        valid: [
            "top",
            "bottom",
            "center",
            "100%",
            "left center",
            "bottom left",
            "left 10px",
            "center bottom",
            "10% top",
            "left 10px bottom",
            "right top 5%",
            "top 3em center",
            "center top 3em",
            "right 3% center",
            "center right 3%",
            "top 3em right 10%",
            "top, bottom",
            "left 10px, left 10px",
            "right top 5%, left 10px bottom"
        ],

        invalid: {
            "foo"                 : "Expected (<bg-position> | inherit) but found 'foo'.",
            "10% left"            : "Expected end of value but found 'left'.",
            "left center right"   : "Expected end of value but found 'right'.",
            "center 3em right 10%": "Expected end of value but found 'right'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-size",

        valid: [
            "cover",
            "contain",
            "auto",
            "auto auto",
            "1em",
            "1px 1em",
            "1px auto",
            "auto 30%",
            "10% 50%",
            "cover, contain",
            "cover, auto auto",
            "1px, 20% 30%"
        ],

        invalid: {
            "foo"               : "Expected (<bg-size>) but found 'foo'.",
            "1px 1px 1px"       : "Expected end of value but found '1px'."

        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-repeat",

        valid: [
            "repeat-x",
            "repeat-y",
            "repeat",
            "space",
            "round",
            "no-repeat",
            "repeat repeat",
            "repeat space",
            "no-repeat round",
            "repeat-x, repeat-y, space", // PR #103
            "repeat space, no-repeat round"
        ],

        invalid: {
            "foo"               : "Expected (<repeat-style>) but found 'foo'.",
            "repeat-x repeat-y" : "Expected end of value but found 'repeat-y'.",
            "no-repeat round 1px" : "Expected end of value but found '1px'."

        }
    }));




    suite.add(new ValidationTestCase({
        property: "border",

        valid: [
            "1px solid black",
            "black 1px solid",
            "solid black 1px",
            "none",
            "1px solid",
            "solid black"
        ],

        invalid: {
            "foo" : "Expected (<border-width> || <border-style> || <color>) but found 'foo'.",
            "1px solid black 1px" : "Expected end of value but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-left-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-right-color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-left-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected (<x-one-radius> | inherit) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-right-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%",
            "inherit"
        ],

        invalid: {
            "foo"       : "Expected (<x-one-radius> | inherit) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-image-slice",

        valid: [
            "5",
            "50% 60%",
            "10 15 20 23",
            "fill",
            "10 20 fill",
            "fill 25% 10"
        ],

        invalid: {
            "foo" : "Expected ([<number> | <percentage>]{1,4} && fill?) but found 'foo'.",
            "50% 75% 85% 95% 105%" : "Expected end of value but found '105%'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%",
            "5px / 25%",
            "5px 25% / 7px 27%",
            "1px 2px 3px 4px / 5px 6px 7px 8px",
            "inherit"
        ],

        invalid: {
            "foo"   : "Expected (<'border-radius'>) but found 'foo'.",
            "5px x" : "Expected (<'border-radius'>) but found 'x'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-spacing",

        valid: [
            "0",
            "3px",
            "2em",
            "0.4em 12px",
            "inherit"
        ],

        invalid: {
            "1px 0.4em 1px" : "Expected end of value but found '1px'.",
            "foo" : "Expected (<length> | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-left-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected (<x-one-radius> | inherit) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-right-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected (<x-one-radius> | inherit) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-width",

        valid: [
            "1px",
            "1px 1px",
            "1px 1px 1px",
            "1px 1px 1px 1px",
        ],

        invalid: {
            "1px 1px 1px 1px 5px" : "Expected end of value but found '5px'.",
            "foo" : "Expected (<border-width>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-width",

        valid: [
            "1px",
            "1em"
        ],

        invalid: {
            "1px 1px 1px 1px 1px" : "Expected end of value but found '1px'.",
            "foo" : "Expected (<border-width>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-style",

        valid: [
            "solid",
            "none"
        ],

        invalid: {
            "1px" : "Expected (<border-style>) but found '1px'.",
            "foo" : "Expected (<border-style>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-width",

        valid: [
            "1px",
            "1em"
        ],

        invalid: {
            "1px 5px 1px 1px 1px" : "Expected end of value but found '5px'.",
            "foo" : "Expected (<border-width>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-style",

        valid: [
            "solid",
            "none"
        ],

        invalid: {
            "1px" : "Expected (<border-style>) but found '1px'.",
            "foo" : "Expected (<border-style>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "box-shadow",

        valid: [
            "none",
            "5px 5px 5px #ccc",
            "0 0 10px #000000",
            "10px 10px",
            "inset 2px 2px 2px 2px black",
            "2px 2px 2px 2px black inset",
            "#ccc 3px 3px 3px inset",
            "10px 10px #888, -10px -10px #f4f4f4, 0px 0px 5px 5px #cc6600"
        ],

        invalid: {
            "foo"           : "Expected (<shadow>) but found 'foo'.",
            "1px"           : "Expected (<shadow>) but found '1px'.",
            "1em red"       : "Expected (<shadow>) but found '1em red'.",
            "1px 1px redd"  : "Expected end of value but found 'redd'.",
            "none 1px"      : "Expected end of value but found '1px'.",
            "inset 2px 2px 2px 2px black inset" : "Expected end of value but found 'inset'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip",

        valid: [
            "rect(10%, 85%, 90%, 15%)",
            'auto'
        ],

        invalid: {
            "foo" : "Expected (<shape> | auto | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip-path",

        valid: [
            "inset(10% 15% 10% 15%)",
            "circle(30% at 85% 15%)",
            "url('#myPath')",
            "ellipse(40% 40%)",
            "margin-box",
            "ellipse(40% 40%) content-box",
            "stroke-box ellipse(40% 40%)",
            "none"
        ],

        invalid: {
            "stroke-box ellipse(40% 40%) 40%" : "Expected end of value but found '40%'.",
            "x-box" : "Expected (<clip-source> | <clip-path> | none) but found 'x-box'.",
            "foo" : "Expected (<clip-source> | <clip-path> | none) but found 'foo'.",
            "invert(40% 40%)" : "Expected (<clip-source> | <clip-path> | none) but found 'invert(40% 40%)'.",
            "40%" : "Expected (<clip-source> | <clip-path> | none) but found '40%'.",
            "0.4" : "Expected (<clip-source> | <clip-path> | none) but found '0.4'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip-rule",

        valid: [
            "nonzero",
            "evenodd",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (nonzero | evenodd | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "color",

        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent",
            "currentColor"
        ],

        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "display",

        valid: [
            "inline",
            "block",
            "list-item",
            "inline-block",
            "table",
            "inline-table",
            "table-row-group",
            "table-header-group",
            "table-footer-group",
            "table-row",
            "table-column-group",
            "table-column",
            "table-cell",
            "table-caption",
            "grid",
            "inline-grid",
            "run-in",
            "ruby",
            "ruby-base",
            "ruby-text",
            "ruby-base-container",
            "ruby-text-container",
            "contents",
            "none",
            "inherit",
            "-moz-box",
            "-moz-inline-block",
            "-moz-inline-box",
            "-moz-inline-grid",
            "-moz-inline-stack",
            "-moz-inline-table",
            "-moz-grid",
            "-moz-grid-group",
            "-moz-grid-line",
            "-moz-groupbox",
            "-moz-deck",
            "-moz-popup",
            "-moz-stack",
            "-moz-marker",
            "-webkit-box",
            "-webkit-inline-box",
            "-ms-flexbox",
            "-ms-inline-flexbox",
            "flex",
            "-webkit-flex",
            "inline-flex",
            "-webkit-inline-flex"

        ],

        invalid: {
            "foo" : "Expected (inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex) but found 'foo'."
        }
    }));



    suite.add(new ValidationTestCase({
        property: "min-height",

        valid: [
            "1px",
            "1%",
            "calc(100% - 5px)",
            "calc(100% + 1em)",
            "calc(100%/6)",
            "calc(10%*6)",
            "calc((5em - 100%) / -2)",
            "calc(((100% - 15%) / 3 - 1px) * 3 + 10%)",
            "min-content",
            "-moz-fit-content",
            "-moz-available",
            "-webkit-fill-available",
            "contain-floats",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit) but found 'foo'."
        }
    }));

    // test <paint>
    suite.add(new ValidationTestCase({
        property: "fill",

        valid: [
            "url('myGradient')",
            "url('myGradient') darkred",
            "url('myGradient') darkred icc-color(myCmykDarkRed)",
            "currentColor",
            "darkred icc-color(myCmykDarkRed)",
            "none",
            "inherit"
        ],

        invalid: {
            "url('myGradient') inherit" : "Expected end of value but found 'inherit'.",
            "url('myGradient') icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "currentColor icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "icc-color(myCmykDarkRed) darkred" : "Expected (<paint> | inherit) but found 'icc-color(myCmykDarkRed) darkred'.",
            "icc-color(myCmykDarkRed)" : "Expected (<paint> | inherit) but found 'icc-color(myCmykDarkRed)'.",
            "icc-color(myCmykDarkRed) inherit" : "Expected (<paint> | inherit) but found 'icc-color(myCmykDarkRed) inherit'.",
            "inherit icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "none inherit" : "Expected end of value but found 'inherit'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "fill-rule",

        valid: [
            "nonzero",
            "evenodd",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (nonzero | evenodd | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "filter",

        valid: [
            "custom(url(vertexshader.vert) mix(url(fragment.frag) normal source-atop), 4 5, time 0)",
            "blur(30px 30px)",
            "url('#svgFilter')",
            "hue-rotate(10deg)",
            "brightness(0.3) contrast(30)",
            "brightness(0.3) contrast(30) url(commonfilters.svg#filter)",
            "none"
        ],

        invalid: {
            "circle(50% at 0 0)" : "Expected (<filter-function-list> | none) but found 'circle(50% at 0 0)'.",
            "foo" :                "Expected (<filter-function-list> | none) but found 'foo'.",
            "blur(30px 30px) none" : "Expected end of value but found 'none'."
        }
    }));

    ["flex", "-ms-flex", "-webkit-flex"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "1",
                "inherit",
                // From http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-common
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                "0 auto",
                "0 1 auto",
                "auto",
                "none",
                "1 1 0%"
            ],

            invalid: {
                "foo": "Expected (none | inherit | <flex-grow> <flex-shrink>? || <flex-basis>) but found 'foo'."
            }
        }));
    });

    ["flex-basis", "-webkit-flex-basis"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                "auto",
                "12px",
                "3em",
                "0"
            ],

            invalid: {
                "foo": "Expected (<width>) but found 'foo'."
            }
        }));
    });

    ["flex-direction", "-ms-flex-direction", "-webkit-flex-direction"].forEach(function(prop_name) {
        var prop_definition = "row | row-reverse | column | column-reverse";
        if (prop_name == "-ms-flex-direction") {
            prop_definition += " | inherit";
        }
        var valid_values = [
            // "initial", // FIXME this needs to be integrated as a univerally acceptable value
            "row",
            "row-reverse",
            "column",
            "column-reverse"
        ];
        if (prop_name == "-ms-flex-direction") {
            valid_values.push("inherit");
        }
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: valid_values,

            invalid: {
                "foo": "Expected (" + prop_definition + ") but found 'foo'."
            }
        }));
    });

    ["flex-flow", "-webkit-flex-flow"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                // from http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-flow-property
                "row",
                "column wrap",
                "row-reverse wrap-reverse",
                "wrap"
            ],

            invalid: {
                "foo": "Expected (<flex-direction> || <flex-wrap>) but found 'foo'."
            }
        }));
    });

    ["flex-grow", "-webkit-flex-grow"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                "0",
                "1",
                "1.5"
            ],

            invalid: {
                "foo": "Expected (<number>) but found 'foo'."
            }
        }));
    });

    ["flex-shrink", "-webkit-flex-shrink"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                "0",
                "1",
                "1.5"
            ],

            invalid: {
                "foo": "Expected (<number>) but found 'foo'."
            }
        }));
    });

    ["flex-wrap", "-ms-flex-wrap", "-webkit-flex-wrap"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // "initial", // FIXME this needs to be integrated as a univerally acceptable value
                "nowrap",
                "wrap",
                "wrap-reverse"
            ],

            invalid: {
                "foo": "Expected (nowrap | wrap | wrap-reverse) but found 'foo'."
            }
        }));
    });

    suite.add(new ValidationTestCase({
        property: "glyph-orientation-horizontal",

        valid: [
            "-43deg",
            ".7deg",
            "90deg",
            "521deg",
            "inherit"
        ],

        invalid: {
            "auto" : "Expected (<glyph-angle> | inherit) but found 'auto'.",
            "70rad" : "Expected (<glyph-angle> | inherit) but found '70rad'.",
            "4grad" : "Expected (<glyph-angle> | inherit) but found '4grad'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "glyph-orientation-vertical",

        valid: [
            "auto",
            "-43deg",
            ".7deg",
            "90deg",
            "521deg",
            "inherit"
        ],

        invalid: {
            "70rad" : "Expected (auto | <glyph-angle> | inherit) but found '70rad'.",
            "4grad" : "Expected (auto | <glyph-angle> | inherit) but found '4grad'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-anchor",

        valid: [
            "start",
            "middle",
            "end",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (start | middle | end | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-align",

        valid: [
            "left",
            "right",
            "center",
            "justify",
            "match-parent",
            "start",
            "end",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (left | right | center | justify | match-parent | start | end | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-decoration",

        valid: [
            "none",
            "underline",
            "underline overline line-through blink",
            "inherit"
        ],

        invalid: {
            "none underline" : "Expected end of value but found 'underline'.",
            "line-through none" : "Expected end of value but found 'none'.",
            "inherit blink" : "Expected end of value but found 'blink'.",
            "overline inherit" : "Expected end of value but found 'inherit'.",
            "foo" : "Expected (none | <text-decoration> | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-rendering",

        valid: [
            "auto",
            "optimizeSpeed",
            "optimizeLegibility",
            "geometricPrecision",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "object-fit",

        valid: [
            "fill",
            "contain",
            "cover",
            "none",
            "scale-down"
        ],

        invalid: {
            "foo" : "Expected (fill | contain | cover | none | scale-down) but found 'foo'.",
            "inherit" : "Expected (fill | contain | cover | none | scale-down) but found 'inherit'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "object-position",

        valid: [
            "top",
            "bottom",
            "center",
            "100%",
            "left center",
            "bottom left",
            "left 10px",
            "center bottom",
            "10% top",
            "left 10px bottom",
            "right top 5%",
            "top 3em center",
            "center top 3em",
            "top 3em right 10%",
        ],

        invalid: {
            "foo"                 : "Expected (<position> | inherit) but found 'foo'.",
            "10% left"            : "Expected end of value but found 'left'.",
            "left center right"   : "Expected end of value but found 'right'.",
            "center 3em right 10%": "Expected end of value but found 'right'.",
            "top, bottom"         : "Expected end of value but found ','."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "-0.75" : "Expected (<opacity-value> | inherit) but found '-0.75'.",
            "12" : "Expected (<opacity-value> | inherit) but found '12'.",
            "foo" : "Expected (<opacity-value> | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "pointer-events",

        valid: [
            "auto",
            "none",
            "visiblePainted",
            "visibleFill",
            "visibleStroke",
            "visible",
            "painted",
            "fill",
            "stroke",
            "all",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-dasharray",

        valid: [
            "0",
            "4",
            "20px",
            "20px 40px 30px",
            "20px, 40px, 30px",
            "calc(1px + 2px) calc(3px + 1em)",
            "none",
            "inherit"
        ],

        invalid: {
            "-20px" : "Expected (none | <dasharray> | inherit) but found '-20px'.",
            "20px," : "Expected end of value but found ','.",
            "20px, -20px": "Expected end of value but found ','.",
            "auto"  : "Expected (none | <dasharray> | inherit) but found 'auto'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-linecap",

        valid: [
            "butt",
            "round",
            "square",
            "inherit"
        ],

        invalid: {
            "auto" : "Expected (butt | round | square | inherit) but found 'auto'.",
            "none" : "Expected (butt | round | square | inherit) but found 'none'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-linejoin",

        valid: [
            "miter",
            "round",
            "bevel",
            "inherit"
        ],

        invalid: {
            "auto" : "Expected (miter | round | bevel | inherit) but found 'auto'.",
            "none" : "Expected (miter | round | bevel | inherit) but found 'none'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-miterlimit",

        valid: [
            "1",
            "1.4",
            "20",
            "10",
            "inherit"
        ],

        invalid: {
            "-10" : "Expected (<miterlimit> | inherit) but found '-10'.",
            "0.5" : "Expected (<miterlimit> | inherit) but found '0.5'.",
            "foo" : "Expected (<miterlimit> | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "-ms-touch-action",

        valid: [
            "auto",
            "none",
            "pan-x",
            "pan-y",
            "pan-left",
            "pan-right",
            "pan-up",
            "pan-down",
            "manipulation"
        ],

        invalid: {
            "foo" : "Expected (auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "touch-action",

        valid: [
            "auto",
            "none",
            "pan-x",
            "pan-y",
            "pan-left",
            "pan-right",
            "pan-up",
            "pan-down",
            "manipulation"
        ],

        invalid: {
            "foo" : "Expected (auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "vertical-align",

        valid: [
            "baseline",
            "sub",
            "super",
            "top",
            "text-top",
            "middle",
            "bottom",
            "text-bottom",
            "25%",
            "-1px",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length> | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "z-index",

        valid: [
            "1",
            "auto",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (<integer> | auto | inherit) but found 'foo'."
        }
    }));

    // Test star hack
    suite.add(new ValidationTestCase({
        property: "*z-index",

        valid: [
            "1",
            "auto",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (<integer> | auto | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "writing-mode",

        valid: [
            "horizontal-tb",
            "vertical-rl",
            "vertical-lr",
            "lr-tb",
            "rl-tb",
            "tb-rl",
            "bt-rl",
            "tb-lr",
            "bt-lr",
            "lr-bt",
            "rl-bt",
            "lr",
            "rl",
            "tb",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "overflow-wrap",

        valid: [
            "normal",
            "break-word"
        ],

        invalid: {
            "foo" : "Expected (normal | break-word) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "padding-left",

        valid: [
            "0",
            "6px",
            "3%",
            "1em",
            "calc(100% - 80px)",
            "inherit"
        ],

        invalid: {
            "-10px" : "Expected (<padding-width> | inherit) but found '-10px'.",
            "-3%"   : "Expected (<padding-width> | inherit) but found '-3%'.",
            "auto"   : "Expected (<padding-width> | inherit) but found 'auto'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "will-change",

        valid: [
            "inherit",
            "initial",
            "unset",
            "auto",
            "scroll-position",
            "contents",
            "opacity",
            "transform",
            "opacity, transform",
            "left, top",
            "height, opacity, transform, width"
        ],

        invalid: {
            "2px"               : "Expected (<will-change> | inherit | initial | unset) but found '2px'.",
            "opacity transform" : "Expected end of value but found 'transform'.",
            "will-change"       : "Expected (<will-change> | inherit | initial | unset) but found 'will-change'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "word-wrap",

        valid: [
            "normal",
            "break-word"
        ],

        invalid: {
            "foo" : "Expected (normal | break-word) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "unicode-bidi",

        valid: [
            "normal",
            "embed",
            "isolate",
            "bidi-override",
            "isolate-override",
            "plaintext",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit) but found 'foo'."
        }
    }));

    YUITest.TestRunner.add(suite);

})();
