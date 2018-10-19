/**
 * Convert CSS colors from one color scheme to another.
 * Supports RGB/RGBA/HSL/HSLA & HEX (RGB) Color schemes.
 *
 * @category  WeBuilder Plugin
 * @package   CSS Color Converter
 * @author    Peter Klein <pmk@io.dk>
 * @copyright 2018 Peter Klein
 * @license   http://www.freebsd.org/copyright/license.html  BSD License
 * @version   1.01
 */

/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 *     45   function ShowColorConverter()
 *     75   function main()
 *    107   function InternalToPeriod(value)
 *    119   function PeriodToInternal(value)
 *    132   function Round(floatVar)
 *    147   function RoundFloat(floatVar, decimalPlaces)
 *    161   function Ceil(floatVar)
 *    176   function CeilFloat(floatVar, decimalPlaces)
 *    190   function Floor(floatVar)
 *    205   function FloorFloat(floatVar, decimalPlaces)
 *    220   function Max(x,y)
 *    234   function Min(x,y)
 *    248   function HexToDec(hexNum)
 *    263   function ValToDec(val, base)
 *    276   function IntToHex(intNum)
 *    295   function rgbToHsl(r, g, b, decimals)
 *    335   function hslToRgb(h, s, l)
 *    340   function hue2rgb(p, q, t)
 *    373   function CreateModal()
 *    497   function UpdateOutput(Sender, key)
 *    554   function UpdateSavedState(Sender, key)
 *    580   function ConvertColors()
 *    668   function OnInstalled()
 *
 * TOTAL FUNCTIONS: 23
 * (This index is automatically created/updated by the WeBuilder plugin "DocBlock Comments")
 *
 */

function ShowColorConverter() {

	// Global variables
	var modalForm,	 			// Modal Object
			cmbFrom,		 			// "From" Combobox Object
			cmbTo,						// "To" Combobox Object
			lblOutput,				// "Output" Label object
			chkPercent,				// "Use Percent" Checkbox Object
			chkUseFract,			// "Use Fract" Checkbox Object
			btnOK,						// "OK" Button Object
			btnCancel,				// "Cancel" Button Object
			chkPercentSavedState = false,
			savedStateFlag = false,
			defaultHslDecimals = _t(Script.ReadSetting("HSL decimals checked as default", "0")),
			regExDef = "\\(\\s*([\\d\\.]+%?)\\s*,\\s*([\\d\\.]+%?)\\s*,\\s*([\\d\\.]+%?)\\s*(?:(?:,\\s*([\\d\\.]+%?)\\s*)?)\\)",
			regExHEX = "#([\\da-f]{1,2})([\\da-f]{1,2})([\\da-f]{1,2})", // Match HEX Colors in format: #rrggbb or #rgb
			// Some systems use COMMA as decimal separator instead of PERIOD
 			// Create a floating point number and remove the digits to get the internal decimal separator.
			decimalSeparator	= RegexReplace(_t(1/2), "\\d*", "", true),
			validColor					= "$0025563b", // #3B5625;
			invalidColor				= "$00353577", // #773535;
			selection 				= Editor.SelText; //obtain current selection

	/**
	 *
	 * Main function
	 *
	 * @return      void
	 *
	 */
	function main() {

		if (Document.CurrentCodeType != 3) {
			alert("Not a CSS file or inside a style tag!");
			return;
		}

		if (selection == "") {
			alert("No CSS data selected!");
			return;
		}

		CreateModal();

	  var modalResult = modalForm.ShowModal;
		if (modalResult == mrOK) {

			ConvertColors();

		}
		// Remove Modal object
		delete modalForm;
	}

	/**
	 *
	 * Helper function: Convert internal decimal separator into a PERIOD
	 *
	 * @param     mixed  value: The value to change
	 * @return    string
	 *
	 */
	function InternalToPeriod(value) {
		return Replace(_t(value), decimalSeparator, ".");
	}

	/**
	 *
	 * Helper function: Convert PERIOD into internal decimal separator
	 *
	 * @param     mixed  value: The value to change
	 * @return    string
	 *
	 */
	function PeriodToInternal(value) {
		return Replace(_t(value), ".", decimalSeparator);
	}

	/**
	 *
	 * Helper function: Returns the value of a number rounded to the nearest integer.
	 * Redefining the build-in Round function which is useless as it uses "Bankers rounding"
	 *
	 * @param     float   floatVar: The number to round
	 * @return    int
	 *
	 */
	function Round(floatVar) {
		var r = Trunc(floatVar);
		if (Frac(floatVar) >= (1/2)) r = r + 1;
		return r;
 	}

	/**
	 *
	 * Helper function: Round float var to the nearest integer with specific number of decimals
	 *
	 * @param     float   floatVar: The number to round
	 * @param     int     decimalPlaces: Number of decimals
	 * @return    float
	 *
	 */
	function RoundFloat(floatVar, decimalPlaces) {
		var p = StrToInt(Copy("1000000000", 1, decimalPlaces + 1)),
				r = Round(floatVar * p);
		return r / p;
 	}

	/**
	 *
	 * Helper function: Returns the smallest integer greater than or equal to a given number.
	 *
	 * @param     float   floatVar: The number to round
	 * @return    int
	 *
	 */
	function Ceil(floatVar) {
		var r = Trunc(floatVar);
		if (r != floatVar) r = r + 1;
		return r;
 	}

	/**
	 *
	 * Helper function: Returns the smallest integer greater than or equal to a given number with specific number of decimals
	 *
	 * @param     float   floatVar: The number to round
	 * @param     int     decimalPlaces: Number of decimals
	 * @return    float
	 *
	 */
	function CeilFloat(floatVar, decimalPlaces) {
		var p = StrToInt(Copy("1000000000", 1, decimalPlaces + 1)),
				r = Ceil(floatVar * p);
		return r / p;
 	}

	/**
	 *
	 * Helper function: Returns the largest integer less than or equal to a given number
	 *
	 * @param     float   floatVar: The number to round
	 * @return    int
	 *
	 */
	function Floor(floatVar) {
		var r = Trunc(floatVar);
		if (r != floatVar) r = r - 1;
		return r;
 	}

	/**
	 *
	 * Helper function: Returns the largest integer less than or equal to a given number with specific number of decimals
	 *
	 * @param     float   floatVar: The number to round
	 * @param     int     decimalPlaces: Number of decimals
	 * @return    float
	 *
	 */
	function FloorFloat(floatVar, decimalPlaces) {
		var p = StrToInt(Copy("1000000000", 1, decimalPlaces + 1)),
				r = Floor(floatVar * p);
		return r / p;
 	}

	/**
	 *
	 * Helper function: Returns the largest of two numbers.
	 *
	 * @param     number  x: The 1st value
	 * @param     number  y: The 2nd value
	 * @return    number
	 *
	 */
	function Max(x,y) {
		if (x > y) return x;
		return y;
	}

	/**
	 *
	 * Helper function: Returns the smallest two numbers.
	 *
	 * @param     number  x: The 1st value
	 * @param     number  y: The 2nd value
	 * @return    number
	 *
	 */
	function Min(x,y) {
		if (x < y) return x;
		return y;
	}

	/**
	 *
	 * Helper function: Convert 2-byte Hexadecimal number to integer
	 * 1-byte hexadecimal numbers will be doubled up ie. 7 = 77
	 *
	 * @param     string  hexNum: The Hexadecimal value
	 * @return    string
	 *
	 */
	function HexToDec(hexNum) {
		if (Length(hexNum) == 1) hexNum = hexNum + "" + hexNum;
		return StrToInt("0x" + hexNum);
	}

	/**
	 *
	 * Helper function: Convert string value to float
	 * if percentage value is used, return value will be 255 * value / 100 * base;
	 *
	 * @param     string  val: The value
	 * @param     int     base: The base value (100 or 255)
	 * @return    float
	 *
	 */
	function ValToDec(val, base) {
		if (RegexMatch(_t(val), "%$", true) != "") val = Round(StrToFloat(Replace(_t(val), "%", "")) / 100 * base);
		else val = StrToFloat(_t(val));
		return val;
	}
	/**
	 *
	 * Helper function: Convert integer value to 2-byte Hexadecimal number
	 *
	 * @param     int  intNum: The value
	 * @return    string
	 *
	 */
	function IntToHex(intNum) {
		var hex = "0123456789abcdef",
				h = Trunc(intNum / 16),
				l = intNum - (h * 16);
		return Copy(hex,h + 1,1) + Copy(hex,l + 1,1);
	}

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r         The red color value
	 * @param   Number  g         The green color value
	 * @param   Number  b         The blue color value
	 * @param   Number  decimals  Number of decimals in output values
	 * @return  Array             The HSL representation
	 */
	function rgbToHsl(r, g, b, decimals) {
		r = r / 255;
		g = g / 255;
		b = b / 255;
		var min = Min(r, Min(g, b)),
	  		max = Max(r, Max(g, b)),
				d = max - min,
				h, s, l = (max + min) / 2;

		if (d == 0) {
			h = 0;
			s = 0;
		}
		else {
			if (l > (1/2)) s = d / (2 - max - min);
			else s = d / (max + min);
			switch (max) {
				case r: {
					if (g < b) h = (g - b) / d + 6;
					else h = (g - b) / d;
				}
				case g: h = (b - r) / d + 2;
				case b: h = (r - g) / d + 4;
			};
			h = h / 6;
    }
		return [FloorFloat(h * 360, decimals), FloorFloat(s * 100, decimals), FloorFloat(l * 100, decimals)];
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  l       The lightness
	 * @return  Array           The RGB representation
	 */
	function hslToRgb(h, s, l) {
		var r, g, b;
		h = h / 360;
		s = s / 100;
		l = l / 100;
		function hue2rgb(p, q, t) {
			if(t < 0) t = t + 1;
			if(t > 1) t = t - 1;
			if(t < 1/6) return (p + (q - p) * 6 * t);
			if(t < 1/2) return q;
			if(t < 2/3) return (p + (q - p) * (2/3 - t) * 6);
			return p;
		}

		if(s == 0) {
			r = l;
			g = l;
			b = l; // achromatic
		}
		else {
			var q;
			if (l < (1/2)) q = l * (1 + s);
			else q = l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, (h + 1/3));
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, (h - 1/3));
		}
		return [Round(r * 255), Round(g * 255), Round(b * 255)];
	}

	/**
	 *
	 * Create the Modal GUI Form
	 *
	 * @return      void
	 *
	 */
	function CreateModal() {

	  var mleft = 16,
				mtop = 14,
				lspace = 6,
				vspace = 26;

	  modalForm = new TForm(WeBuilder);
	  modalForm.Width = 270;
	  modalForm.Height = 156;
	  modalForm.Position = poScreenCenter;
	  modalForm.BorderStyle = bsSingle; //disable dialog resizing
	  modalForm.BorderIcons = biSystemMenu; //remove maximize & minimize buttons
	  modalForm.Caption = "CSS Color Converter";

		// 1st line of controls

		// From colorscheme label object
	  var lbFrom = new TLabel(modalForm);
	  lbFrom.Parent = modalForm;
	  lbFrom.Caption = "Convert from:";
	  lbFrom.SetBounds(mleft, mtop, 80, 15);

		// From colorscheme selectbox object
	  cmbFrom = new TComboBox(modalForm);
	  cmbFrom.Parent = modalForm;
	  cmbFrom.Items.Add("hex");
	  cmbFrom.Items.Add("rgb");
	  cmbFrom.Items.Add("hsl");
	  cmbFrom.Items.Add("rgba");
	  cmbFrom.Items.Add("hsla");
	  cmbFrom.ItemIndex = 0;
		cmbFrom.Style = csOwnerDrawFixed; // If set to csDropDown (default value) then keyboard entry is possible
		cmbFrom.OnChange = "UpdateOutput";
		cmbFrom.Hint = "The color scheme you want to convert FROM.";
		cmbFrom.ShowHint = true;
	  cmbFrom.SetBounds(mleft + 80 + lspace, mtop-3, 60, 21);

		// To colorscheme label object
	  var lbTo = new TLabel(modalForm);
	  lbTo.Parent = modalForm;
	  lbTo.Caption = "to:";
	  lbTo.SetBounds(mleft + 80 + 60 + lspace + lspace, mtop, 14, 15);

		// To colorscheme selectbox object
	  cmbTo = new TComboBox(modalForm);
	  cmbTo.Parent = modalForm;
		cmbTo.Name = "cmbTo";
	  cmbTo.Items.Add("hex");
	  cmbTo.Items.Add("rgb");
	  cmbTo.Items.Add("hsl");
	  cmbTo.Items.Add("rgba");
	  cmbTo.Items.Add("hsla");
	  cmbTo.ItemIndex = 1;
		cmbTo.Style = csOwnerDrawFixed; // If set to csDropDown (default value) then keyboard entry is possible
		cmbTo.OnChange = "UpdateOutput";
		cmbTo.Hint = "The color scheme you want to convert TO.";
		cmbTo.ShowHint = true;
	  cmbTo.SetBounds(mleft + 80 + 60 + 14 + lspace + lspace + lspace, mtop-3, 60, 21);

		// 2nd line of controls

		// Use Percent checkbox object
	  chkPercent = new TCheckBox(modalForm);
	  chkPercent.Parent = modalForm;
	  chkPercent.Checked = false;
		chkPercent.Caption = "Use % range?";
		chkPercent.OnClick = "UpdateSavedState";
		chkPercent.Enabled = true;
		chkPercent.Hint = "If checked, output units wil be in range 0%-100% instead of 0-255.";
		chkPercent.ShowHint = true;
	  chkPercent.setBounds(mleft, mtop + (vspace*1)-1, 105, 21);

		// Use Decimals checkbox object
	  chkUseFract = new TCheckBox(modalForm);
	  chkUseFract.Parent = modalForm;
	  chkUseFract.Checked = false;
		chkUseFract.Enabled = false;
		chkUseFract.Caption = "Use decimals?";
		chkUseFract.OnClick = "UpdateOutput";
		chkUseFract.Hint = "If checked, percentage output will include decimals.";
		chkUseFract.ShowHint = true;
	  chkUseFract.setBounds(mleft + 105 + lspace , mtop + (vspace*1)-1, 100, 21);

		// 3rd line of controls

		// Output label object
	  lblOutput = new TLabel(modalForm);
	  lblOutput.Parent = modalForm;
	  lblOutput.Caption = "";
		lblOutput.Font.Style = fsItalic + fsBold;
		lblOutput.Font.Color = validColor;
		lblOutput.ShowHint = false;
	  lblOutput.setBounds(mleft+2, mtop + (vspace*2), 226, 15);

		// 4th line of controls

		// OK button object
	  btnOk = new TButton(modalForm);
	  btnOK.Parent = modalForm;
	  btnOk.Caption = "OK";
	  btnOk.Default = True;
	  btnOK.ModalResult = mrOK;
	  btnOk.SetBounds(mleft, mtop + (vspace*3), 75, 25);

		// Cancel button object
	  btnCancel = new TButton(modalForm);
	  btnCancel.Parent = modalForm;
	  btnCancel.Caption = "Cancel";
	  btnCancel.Cancel = True;
	  btnCancel.ModalResult = mrCancel;
	  btnCancel.SetBounds(modalForm.Width - 75 - mleft -5 , mtop + (vspace*3), 75, 25);
	}

	/**
	 *
	 * OnClick, OnChange, OnExit, OnKeyUp event handler
	 * Toggles checkbox states and updates the "Output" label to display info
	 *
	 * @param     object  Sender: The parent object
	 * @param     string  key: The character key pressed
	 * @return    void
	 *
	 */
	function UpdateOutput(Sender, key) {
		var fromType = Lowercase(_t(cmbFrom.Text)),
				toType = Lowercase(_t(cmbTo.Text)),
				color		 = validColor,
				caption	 = "";

		if (Copy(toType,1,3)=="hsl") {
			// HSL/HSLA

			// Save current checkbox state
			savedStateFlag = true;
			chkPercentSavedState = chkPercent.Checked;

			chkPercent.Checked = true;
			chkPercent.Enabled = false;

			if ((defaultHslDecimals) && (Sender.Name == "cmbTo")) chkUseFract.Checked = true;
		}
		else if (toType=="hex") {
			// HEX

			// Save current checkbox state
			savedStateFlag = true;
			chkPercentSavedState = chkPercent.Checked;

			chkPercent.Checked = false;
			chkPercent.Enabled = false;
		}
		else if (Copy(toType,1,3)=="rgb") {
			// RGB/RGBA

			// Restore saved checkbox state
			chkPercent.Checked = chkPercentSavedState;
			chkPercent.Enabled = true;
		}

		if ( (Copy(fromType,Length(fromType),1)=="a") && (Copy(toType,Length(toType),1) != "a") ) {
			caption = "Warning - alpha channel will be lost!";
			color = invalidColor;
		}
		else if ( (Copy(fromType,1,3)!="hsl") && (Copy(toType,1,3) == "hsl") && (!chkUseFract.Checked)) {
			caption = "Use decimals for better precision!";
		}
		lblOutput.Font.Color = color;
		lblOutput.Caption = caption + " "; // Extra space needed at the end due to windows italics bug.
	}

	/**
	 *
	 * OnClick event handler
	 * Toggles decimals checkbox on/of depending of state of percent checkbox
	 *
	 * @param     object  Sender: The parent object
	 * @param     string  key: The character key pressed
	 * @return    void
	 *
	 */
	function UpdateSavedState(Sender, key) {
		if (chkPercent.Checked) {
			// Enable decimals checkbox
			chkUseFract.Enabled = true;
		}
		else {
			// Disable decimals checkbox
			chkUseFract.Enabled = false;
		}

		if (savedStateFlag) {
			savedStateFlag = false;
		}
		else {
			// Save checkbox state
			chkPercentSavedState = chkPercent.Checked;
		}
	}

	/**
	 *
	 * Loop through editor selection and convert colors
	 *
	 * @return    void
	 *
	 */
	function ConvertColors() {

		var fromType = Lowercase(_t(cmbFrom.Text)),
				toType = Lowercase(_t(cmbTo.Text)),
				full, type, g1, g2, g3, r, g, b, h, s, l, a,
				decimals = 0,
				regEx = fromType + regExDef;
		if (fromType == "hex") regEx = regExHEX;
    if (chkUseFract.Checked) decimals = 2;

		if ( (Copy(fromType,Length(fromType),1)=="a") && (Copy(toType,Length(toType),1) != "a") ) {
			if (Confirm("Warning!\nYou are about to lose the color alpha channel information.\nAre you sure you want to proceed?") == false) return;
		}

		if (RegexMatchAll(selection, regEx, true, matches, poses) == true) {
			var len = Length(matches);
			if (len > 0) {
				for (var f = 0; f < len; f++) {   // iterate through all matches
					full = _v(matches, [f, 0]);	// Full match
					type = Lowercase(Copy(full, 1, 1)); // # = hex, r = rgb,/rgba, h = hsl/hsla
					g1 = _v(matches, [f, 1]);	// 1st capturing group
					g2 = _v(matches, [f, 2]);	// 2nd capturing group
					g3 = _v(matches, [f, 3]);	// 3rd capturing group
					try {
						a = _v(matches, [f, 4]);	// Optional 4th capturing group
					}
					except {
						a = 1;
					}

					if ((type == "#") || (type == "r")) {
						// RGB based colors
						if (type == "#") {
							// HEX type
							r = HexToDec(g1);
							g = HexToDec(g2);
							b = HexToDec(g3);
						}
						else {
							// RGB/RGBA type
							r = ValToDec(g1, 255);
							g = ValToDec(g2, 255);
							b = ValToDec(g3, 255);
						}
						re = rgbToHsl(r, g, b, decimals);
						h = InternalToPeriod(re[0]);
						s = InternalToPeriod(re[1]);
						l = InternalToPeriod(re[2]);
					}
					else {
						// HSL based colors
						h = ValToDec(g1, 360);
						s = ValToDec(g2 ,100);
						l = ValToDec(g3, 100);
						re = hslToRgb(h, s, l);
						r = re[0];
						g = re[1];
						b = re[2];
					}

          if ((Copy(toType,1,3)=="rgb") && (chkPercent.Checked)) {
        		r = InternalToPeriod(RoundFloat(r / 255 * 100, decimals)) + "%";
        		g = InternalToPeriod(RoundFloat(g / 255 * 100, decimals)) + "%";
        		b = InternalToPeriod(RoundFloat(b / 255 * 100, decimals)) + "%";
          }

					switch(toType) {
						case "hsl":   out =  "hsl(" + _t(h) + ", " + _t(s) + "%, " + _t(l) + "%)";
						case "hsla":  out = "hsla(" + _t(h) + ", " + _t(s) + "%, " + _t(l) + "%, " + _t(a) + ")";
						case "rgb":   out =  "rgb(" + _t(r) + ", " + _t(g) + ", " + _t(b) + ")";
						case "rgba":  out = "rgba(" + _t(r) + ", " + _t(g) + ", " + _t(b) + ", " + _t(a) + ")";
						default: out = "#" + IntToHex(r) + IntToHex(g) + IntToHex(b);
					}

			 		selection = Replace(selection, full , out);

				}
				// Update editor selection
				Editor.SelText = selection;
			}
		}

	}

	// Start the main plugin function
	main();
}

function OnInstalled() {
  alert("CSS Color Converter 1.01 by Peter Klein installed sucessfully!");
}

Script.ConnectSignal("installed", "OnInstalled");
var bmp = new TBitmap, act = Script.RegisterDocumentAction("", "Convert Colors", "Ctrl+Shift+C", "ShowColorConverter");
LoadFileToBitmap(Script.Path + "css_color_converter_image.png", bmp);
Actions.SetIcon(act, bmp);

delete bmp;