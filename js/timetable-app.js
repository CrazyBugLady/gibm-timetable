		$( document ).ready(function() {
			var selectBerufsgruppe = $('#drpdBerufsgruppe');
			var selectKlasse = $('#drpdKlasse');
			var btnGoFurther = $('#lbFurther');
			var btnGoBack = $('#lbBack');
			
			var FormGroupBerufsgruppe = $('#fgBerufsgruppe');
			var FormGroupKlasse = $('#fgKlasse');
			var divStundenplan = $('#Stundenplan');
			var divStundenplanLegend = $('#Stundenplan #legend');
			var divInformation = $('#KWInformation');
			var pnlErrors = $('#errors');
			var pnlErrorsBody = $('#errors .panel-body');
			
			var tblStundenplan = $('#tblStundenplan tbody');
			var KW = KalenderWoche();
			var Year = getCurrentYear();
						
			FormGroupKlasse.hide();
			divStundenplan.hide();
			pnlErrors.hide();
			
			 $.ajax('http://home.gibm.ch/interfaces/133/berufe.php', {
				dataType: 'json',
				success: function(data) {
					$.each(data, function(index, item) {
						var selected = "";
						
						if(getAktuelleBerufsgruppe() == item.beruf_id)
						{
							var selected = " selected ";
							getKlassen(item.beruf_id);
						}
					
						selectBerufsgruppe.append('<option value="' + item.beruf_id + '"'+ selected +'>' + item.beruf_name + '</option>');
					});
					
					selectBerufsgruppe.stop();
					FormGroupBerufsgruppe.hide().fadeIn();
				},
			
				error: function(xhr, status, error) {
				}
			});
			
		// zuweisen der Eventhandler
		selectBerufsgruppe.change(function() {
			var idBeruf = selectBerufsgruppe.val();
			getKlassen(idBeruf);
		});
			
		selectKlasse.change(function() {
			var idKlasse = selectKlasse.val();
			getStundenplaene(idKlasse);
			saveAktuelleKlasse(idKlasse, selectBerufsgruppe.val());
		});
		
		btnGoBack.click(function() {
			goWeekBack();
		});	
		
		btnGoFurther.click(function() {
			goWeekFurther();
		});
			
	    // speichern der gewählten Optionen im localStorage
		function saveAktuelleKlasse(idKlasse, idBeruf)
		{
			// wenn localStorage unterstützt wird
			if(typeof (Storage) !== "undefined")
			{
				localStorage.setItem("beruf_id", idBeruf);
				localStorage.setItem("klasse_id", idKlasse);
			}
		}

		// aus localStorage aktuelle Klasse erhalten.
		function getAktuelleKlasse()
		{
			var idKlasse = 0;
			
			if(typeof(Storage) !== "undefined")
			{
				idKlasse = localStorage.getItem("klasse_id");
			}
			
			return idKlasse;
		} 
		
		// aus localStorage aktuelle Berufsgruppe erhalten
		function getAktuelleBerufsgruppe()
		{
			var idBeruf = 0;
			
			if(typeof(Storage) !== "undefined")
			{
				idBeruf = localStorage.getItem("beruf_id");
			}
			
			return idBeruf;
		}
			
		// mit Ajax Klassen erhalten
		function getKlassen(idBeruf)
		{
			$.ajax('http://home.gibm.ch/interfaces/133/klassen.php', {
				dataType: 'json',
				data:	{ 
					beruf_id: idBeruf
				},
				success: function(data) {
					selectKlasse.empty()
					$.each(data, function(index, item) {
						var selected = "";
						
						if(getAktuelleKlasse() == item.klasse_id)
						{
							var selected = " selected ";
						}
						selectKlasse.append('<option value="' + item.klasse_id + '"'+selected+'>' + item.klasse_name + '</option>');
					});
					
						selectKlasse.stop();//.fadeIn();
						FormGroupKlasse.hide().fadeIn();
						
						var idKlasse = 0;
						if(selectKlasse.val() !== "null")
						{
							idKlasse = selectKlasse.val();
						}
						else
						{
							idKlasse = getAktuelleKlasse();
						}
						
						getStundenplaene(idKlasse);
			
				},
			
				error: function(xhr, status, error) {
				}
			});
		}
		
		// aus dem Array den aktuellen Tag erhalten (array => Nummer)
		function getDayOfWeek(day)
		{
			var DaysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
			
			return DaysOfWeek[day];
		}

		// nach hinten blättern
		function goWeekBack()
		{
			if(KW > 1)
			{
				KW = KW - 1;
			}
			else
			{
				KW = 52;
				Year = Year - 1;
			}

			getStundenplaene(selectKlasse.val());
		}
		
		// nach vorne blättern
		function goWeekFurther()
		{
			if(KW < 52)
			{
				KW = KW + 1;
			}
			else
			{
				KW = 1;
				Year = Year + 1;
			}			
			getStundenplaene(selectKlasse.val());
		}
		
		// Refreshen des Guis mit der KW Information
		function refreshKWInformation()
		{
			divInformation.html("<b>aktuelle KW</b>: " + KW + " <b>ausgewähltes Jahr:</b> " + Year);
		}
		
		// Anzeigen der Fehlermeldungen
		function showErrors(error)
		{
			pnlErrors.fadeIn();
			pnlErrorsBody.html(error);
		}
		
		// erhalten der Stundenplandaten mit Ajax
		function getStundenplaene(idKlasse)
		{
			refreshKWInformation();
			var StundenplanWoche = KW + "-" + Year;
			$.ajax('http://home.gibm.ch/interfaces/133/tafel.php', {
				dataType: 'json',
				data:	{ 
					klasse_id: idKlasse,
					woche: StundenplanWoche
				},
				success: function(data) {
					tblStundenplan.empty();
					pnlErrors.hide();
					var legend = [];
					$.each(data, function(index, item) {
						var tblRow = "<tr>" +
										"<td>" + getDayOfWeek(item.tafel_wochentag) + "</td>" + 
										"<td>" + item.tafel_von + " - " + item.tafel_bis + "</td>" + 
										"<td>" + item.tafel_lehrer + "</td>" + 
										"<td>" + item.tafel_fach + "</td>" +
										"<td>" + item.tafel_raum + "</td>" + 	
										"<td>" + item.tafel_kommentar + "</td>" + 
									 "</tr>"; 
						tblStundenplan.append(tblRow);
						
						var legendEntry = item.tafel_fach + " = " + item.tafel_longfach;
						
						if(legend.indexOf(legendEntry) == -1)
						{
							legend.push(legendEntry);
						}
						buildLegend(legend);
					});
					
					tblStundenplan.stop();//.fadeIn();
					divStundenplan.hide().delay(250).fadeIn();
					
					if(data == "")
					{
						showErrors("Keine Stundenpläne gefunden!");
					}
				},
			
				error: function(xhr, status, error) {
				}
			});
		}
		
		// bildet die Legende aufgrund der Fächer, die ausgegeben werden (Abkürzungen)
		function buildLegend(legend)
		{
			divStundenplanLegend.empty();
			$.each(legend, function(index, item) {
				var legendEntry = item;
				divStundenplanLegend.append(legendEntry + "<br>");
			});
		}
		
		// erhält die Kalenderwoche (Donnerstag -> rechnet zum aktuellen Donnerstag => Differenz Kalenderwoche)
		function KalenderWoche()
		{
			var KWDatum = new Date();

			var DonnerstagDat = new Date(KWDatum.getTime() + (3-((KWDatum.getDay()+6) % 7)) * 86400000);

			KWJahr = DonnerstagDat.getFullYear();

			var DonnerstagKW = new Date(new Date(KWJahr,0,4).getTime() + (3-((new Date(KWJahr,0,4).getDay()+6) % 7)) * 86400000);

			KW = Math.floor(1.5 + (DonnerstagDat.getTime() - DonnerstagKW.getTime()) / 86400000/7);
			
			return KW;
		}
		
		// erhält aus dem Datum das aktuelle Jahr
		function getCurrentYear()
		{
			DatumAktuell = new Date();
			JahrAktuell = DatumAktuell.getFullYear();
			
			return JahrAktuell;
		}
	});