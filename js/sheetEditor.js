var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.SheetEditorWidget = Y.Base.create('sheetEditorWidget', SYS.AppWidget, [], {
        buildTData: function(){
        	
        },
        onInitAppWidget: function(err, appInstance){
        	var groupid = this.get('groupid');
        		
        	this.set('waiting', true);
        	appInstance.groupItem(groupid, function(err, result){
        		this.set('waiting', false);
        			if(!err){
        				this.set('groupItem', result.groupItem);
        					this.renderGroupItem();
        			}
        	}, this);
	        	this.get('boundingBox').on('change', this.change, this);
        },
        destructor: function(){
        	
        },
        renderGroupItem: function(){
        	var groupItem = this.get('groupItem'),
        		tp = this.template;
        		this.set('currentCourse', groupItem.get('numcrs'));
		        	tp.setHTML('groupRenderItem', tp.replace('groupRenderItem', [groupItem.toJSON()]));
        },
        reqSheetList: function(){
        	var objData = {
    			groupid: this.get('groupid'),
        		currentSemestr: this.get('currentSemestr'),
        		numcrs: this.get('currentCourse'),
        		fieldid: this.get('groupItem').get('fieldid')
        	};
        	this.set('waiting', true);
        	this.get('appInstance').sheetList(objData, function(err, result){
        		this.set('waiting', false);
        		if(!err){
        			this.set('sheetList', result.sheetList);
        			this.renderSheetList();
        		}
        	}, this);
        },
        renderSheetList: function(){
        	var sheetList = this.get('sheetList'),
        		tp = this.template,
        		lst = "",
        		type = "";
        	
        	sheetList.each(function(sheet){
        		
        		switch(sheet.get('type')){
	        		 case 1:  type = 'label-success';
	        			 	break;
	        		 case 2: type = 'label-info';
	        		 		break;
	        		 case 3: type = 'label-warning';
	        		 		break;
	        		 case 4: type = 'label-primary';
     		 				break;
        		}
        		
        		lst += tp.replace('rowSheet', [{
        			date: Brick.dateExt.convert(sheet.get('date'), 2),
        			typeClass: type,
        			isRemove: sheet.get('remove') ? tp.replace('label') : ''
        		}, sheet.toJSON()]);
        	});
        	tp.setHTML('listSheet', tp.replace('tableSheet', {rows: lst}));
        		this.set('dataTable', lst);
        },
        addSheetShow: function(flag){
        	var dataTable = this.get('dataTable'),
        		tp = this.template,
        		lst = "";
        	
        	if(flag){
        		this.reqListSubject();
        	} else {
        		tp.setHTML('listSheet', tp.replace('tableSheet', {rows: dataTable}));
        	}
        },
        reqListSubject: function(){
        	var groupItem = this.get('groupItem'),
        		curType = this.get('currentType'),
        		lib = this.get('appInstance'),
        		data = {
        			numcrs: this.get('currentCourse'),
        			semestr: this.get('currentSemestr'),
        			fieldid: groupItem.get('fieldid'),
        			type: curType
        		};
        	
        	this.set('waiting', true);
        	lib.subjectList(data, function(err, result){
        		this.set('waiting', false);
	        		if(!err){
	        			var tp = this.template,
	        				dataTable = this.get('dataTable'),
	        				lst = "";
	        			
	        			result.subjectList.each(function(subject){
	        				lst += tp.replace('liSubject', [subject.toJSON()]);
	        			});
	        			
	        			var ulHtml = tp.replace('ulSubject', {li: lst}),
	        				row = tp.replace('rowAddSheet', {
	        					ul: ulHtml
	        				});
	        			tp.setHTML('listSheet', tp.replace('tableSheet', {rows: row + dataTable}));
	        		}
        	}, this);
        	
        		if(curType == 2 || curType == 4){
        			this.set('waiting', true);
        			lib.studList(groupItem.get('id'), function(err, result){
        				this.set('waiting', false);
        					this.set('studList', result.studList);
        						this.renderStudList();
        			}, this);
        		}
        },
        renderStudList: function(){
        	var tp = this.template,
        		studList = this.get('studList'),
        		lst = "";
        	
        	studList.each(function(stud){
        		lst += tp.replace('rowStud',[stud.toJSON()]);
        	});
        	tp.setHTML('rowAddSheet.studList', lst);
        },
        actSheet: function(id){
        	var tp = this.template,
        		valDate = id ? 
        					tp.getValue('rowEditSheet.inpDate').split('-') :
        						tp.getValue('rowAddSheet.inpDate').split('-'),
        		stud = id ? 
        					tp.gel('rowEditSheet.studList').children :
        						tp.gel('rowAddSheet.studList').children,
        		numBookStud = [],
        		lib = this.get('appInstance'),
        		fioteacher = id ? 
    							tp.getValue('rowEditSheet.inpFioteacher') :
    								tp.getValue('rowAddSheet.inpFioteacher');
    		
    		var type = this.get('currentType');
    							
        	if(type == 2 || type == 4){
            	for(var i = 0; i < stud.length; i++){
            		var val = stud[i].value;
    	        		if(val && stud[i].checked){
    	       				numBookStud.push(val);
    	        		}
            	}
        	}
        					
			var objData = {
	        			idSubject: this.get('currentSubject'),
	        			date: lib.getDate(valDate),//получить в мсек
	        			groupid: this.get('groupid'),
	        			idSheet: id ? id : 0,
	        			typeSheet: this.get('currentType'),
	        			numBookStud: numBookStud,
	        			fioteacher: fioteacher
	        		};
        
	        	this.set('waiting', true);
	        	lib.sheetSave(objData, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.reqSheetList();
		        			this.set('currentSubject', 0);
		        			this.set('currentType', 0);
		        		}
	        	}, this);
        },
        removeSheet: function(sid){
        	this.set('waiting', true);
        	this.get('appInstance').sheetRemove(sid, function(err, result){
        		this.set('waiting', false);
        			if(!err){
        				this.reqSheetList();
        			}
        	}, this);
        },
        editSheet: function(id, row){
        	var tp = this.template,
        		lst = "";
        	
        	lst += tp.replace('rowEditSheet', [{
        		subject: row.cells[1].innerHTML,
        		date: this.get('appInstance').setDate(row.cells[2].innerHTML),
        		id: id,
        		fioteacher: row.cells[3].innerHTML
        	}]);
        	row.innerHTML = lst;
        },
        reqMarkList: function(obj){
        	var idSheet = this.get('currentIdSheet');
        	
        	this.set('waiting', true);
        	this.get('appInstance').markList(idSheet, function(err, result){
        		this.set('waiting', false);
	        		if(!err){
	        			this.set('markList', result.markList);
	        				this.renderMarkList(obj);
	        		}
        	}, this);
        },
        renderMarkList: function(obj){
        	var tp = this.template,
        		form = this.parseFormControl(obj.formControl),
        		table = obj.frmStudy == 'очная' ? this.renderTableOch() : this.renderTableZaoch(form);

        	tp.setHTML('tablMark', tp.replace('tableMarkStud', {
        		nameSubj: obj.subj,
        		formcontrol: form,
        		data: table,
        		fioteacher: obj.fio
        	}));
        },
        parseFormControl: function(formControl){
        	var arr = formControl.split('-'),
        		form = arr[0],
        		type = arr[1];
        		
        	return arr[1] > 2 ? 'Курсовая работа' :  form;
        },
        renderTableZaoch: function(form){
        	var markList = this.get('markList'),
        		tp = this.template,
        		lst = "",
        		table = "",
        		n = 0;
        	
        	var blockName = form == 'Зачет' ? 'tradZachet' : 'tradMark';
        	
        	markList.each(function(mark){
        		lst += tp.replace('rowMarkStudZaoch', [{
        			n: ++n,
        			mark: this.setTradMark(mark.get('mark')),
        			li:  tp.replace(blockName, { id: mark.get('id')})
        		}, mark.toJSON()]);
        	}, this);
        	
        	table = tp.replace('tableMarkZaoch', { rows: lst });
        	
        	return table;
        },
        renderTableOch: function(){
        	var markList = this.get('markList'),
	    		currentAttProc = this.get('currentAttProc').split('-'),
	    		tp = this.template,
	    		lst = "",
	    		table = "",
	    		num = 0,
	    		self = this;
    	
		    	markList.each(function(mark){
		    		lst += tp.replace('rowMarkStudOch', [{
		    			n: ++num
		    		}, mark.toJSON()]);
		    	});
		    	
		    	table = tp.replace('tableMarkOch', {
		    		rows: lst,
		    		a1: currentAttProc[0],
		    		a2: currentAttProc[1],
		    		a3: currentAttProc[2],
		    		sumProc: 100
		    	});
		    	
		    	return table;
        },
        change: function(e){
    		var input = e.target.getDOMNode(),
	    		tp = this.template,
				tpTblMark = tp.idMap.tableMarkOch,
				rowMark = tp.idMap.rowMarkStudOch;
    		
			switch(input.id){
				case tpTblMark.inpAtt1: 
					if(this.checkAtt(input, 0)){
							this.udpateSheet();
								this.reCalcMarkTable();
					}
						break;
				case tpTblMark.inpAtt2: 
					if(this.checkAtt(input, 1)){
							this.udpateSheet();
								this.reCalcMarkTable();
					}
						break;
				case tpTblMark.inpAtt3: 
					if(this.checkAtt(input, 2)){
							this.udpateSheet();
								this.reCalcMarkTable();
					}
						break;
				case rowMark.firstatt:
				case rowMark.secondatt:
				case rowMark.thirdatt:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.calcMark(input.parentNode.parentNode, true);
					break;
				case rowMark.additional:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.calcMarkAdd(input.parentNode.parentNode);
					break;
				case rowMark.debts:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.reqMark(this.parseRowData(input.parentNode.parentNode));
					break;
			}
		},
        checkAtt: function(input, numAtt){
        	var currentAttProc = this.get('currentAttProc').split('-'),
        		tp = this.template,
        		sum = 0;
        	
        		if(!this.checkInp(input.value)){
	        			input.value = 0;
	        	} 
	        		currentAttProc[numAtt] = input.value;
	        		sum = parseInt(currentAttProc[0], 10) + parseInt(currentAttProc[1], 10) + parseInt(currentAttProc[2], 10);
	        			this.set('currentAttProc', currentAttProc.join('-'));
	        			 tp.setHTML('tableMarkOch.sumProc', sum);

	        		if(sum != 100) {
	        				tp.addClass('tableMarkOch.sumProc', 'label-danger');
	        					return false;
	        		} else {
	        				tp.removeClass('tableMarkOch.sumProc', 'label-danger');
	        					return true;
	        		}
        },
        udpateSheet: function(){
        	var objData = {
        		idSheet: this.get('currentIdSheet'),
        		attProc: this.get('currentAttProc')
        	};
        	this.set('waiting', true);
        	this.get('appInstance').updateWeight(objData, function(err, result){
        		this.set('waiting', false);
        	}, this);
        },
        reCalcMarkTable: function(){
        	var rows = this.template.gel('tableMarkOch.tableMark').rows,
        		objData = [],
        		currentAttProc = this.get('currentAttProc').split('-');
        		for(var i = 4; i < rows.length; i++){
        			rows[i].cells[7].firstChild.value = 0;
        				objData.push(this.calcMark(rows[i], false));
        		}
        			this.reqMark(objData);
        },
        calcMark: function(row, update){
        	var tp = this.template,
        		arrRow = row.cells,
        		danger = tp.gel('tableMarkOch.sumProc').className;
        		
        	if(danger.indexOf('danger') == -1){
        			var a1 = tp.gel('tableMarkOch.inpAtt1').value,
            			a2 = tp.gel('tableMarkOch.inpAtt2').value,
            			a3 = tp.gel('tableMarkOch.inpAtt3').value,
            			b1 = +arrRow[3].firstChild.value,
            			b2 = +arrRow[4].firstChild.value,
            			b3 = +arrRow[5].firstChild.value,
            			b4 = +arrRow[7].firstChild.value,
        				result = Math.round((a1 * b1 / 100) + (a2 * b2 / 100) + (a3 * b3 / 100)),
        				resultAdd = result + b4;
        				
        			if(resultAdd > 100){
        				resultAdd = result;
        					alert( 'Окончательная оценка c учетом доп баллов > 100' );
        						arrRow[7].firstChild.value = 0;
        			}
        			arrRow[6].firstChild.innerHTML = result;
        			arrRow[9].firstChild.innerHTML = resultAdd;
        				if(update){
        					var d = this.parseRowData(row);
        					this.reqMark(d);
        				} else {
        					return this.parseRowData(row);
        				}
        	} else {
        		alert( 'сумма аттестаций < 100' );
        	}
        },
        calcMarkAdd: function(row){
        	var tp = this.template,
    			arrRow = row.cells,
    			a1 = +arrRow[6].firstChild.innerHTML,
    			a2 = +arrRow[7].firstChild.value,
    			sum = a1 + a2;
        	
        	if(sum > 100){
        		alert( 'Окончательная оценка c учетом доп баллов > 100' );
        			arrRow[7].firstChild.value = 0;
        				sum = a1;
        	}
        		arrRow[9].firstChild.innerHTML = sum;
				this.reqMark(this.parseRowData(row));
        },
        parseRowData: function(row){
        	var arrRow = row.cells,
	    		objData = {
	        		id: row.id, 
	        		firstatt: arrRow[3].firstChild.value,
	        		secondatt: arrRow[4].firstChild.value,
	        		thirdatt: arrRow[5].firstChild.value,
	        		prliminary: arrRow[6].firstChild.innerHTML,
	        		additional: arrRow[7].firstChild.value,
	        		debts: arrRow[8].firstChild.value,
	        		mark: arrRow[9].firstChild.innerHTML
	        	};
        	return objData;
        },
        markZaochUpdate: function(id, value){
        	var data = {
        		id: id,
        		mark: value
        	};
        	this.set('waiting', true);
	        	this.get('appInstance').markUpdateZaoch(data, function(err, result){
	        		this.set('waiting', false);
	        	}, this);
        },
        reqMark: function(objData){
	        	this.set('waiting', true);
	        	this.get('appInstance').markUpdate(objData, function(err, result){
	        		this.set('waiting', false);
	        	}, this);
        },
        setTradMark: function(val){
        	switch(val){
        		case 101: return 'зачтено';
        		case 102: return 'не явка';
        		case 103: return 'удовлетворительно';
        		case 104: return 'хорошо';
        		case 105: return 'отлично';
        		default: return '';
        	}
        },
        checkInp: function(val){
        	if(!this.isNumeric(val)){
        		alert( 'Введите число' );
        			return false;
        	} else if(!this.isIncluded(val)){
        		alert( 'Значение должно быть от 0 до 100' );
        			return false;
        	}
        		return true;
        },
        isIncluded: function(n){
        	return n >= 0 && n <= 100;
        },
        isNumeric: function(n){
        	return !isNaN(parseFloat(n)) && isFinite(n) && n.indexOf('.') == -1;
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, groupRenderItem, label, tableSheet, rowStud, rowSheet, rowAddSheet, liSubject, ulSubject, rowEditSheet, tableMarkStud, tableMarkOch, rowMarkStudOch, tableMarkZaoch, rowMarkStudZaoch, tradMark, tradZachet'},
            groupid: {value: 0},
            groupItem: {value: null},
            currentSemestr: {value: 0},
            currentCourse: {value: 0},
            sheetList: {value: null},
            dataTable: {value: ''},
            currentSubject: {value: 0},
            markList: {value: null},
            currentIdSheet: {value: 0},
            currentAttProc: {value: ''},
            currentType: {value: 0},
            studList: {value: null}
        },
        CLICKS: {
        	'addSheet-show': {
        		event: function(e){
        			this.set('currentType', e.target.getData('type')); 
        				this.addSheetShow(true);
        		}
        	},
        	'cancel-addSheetShow': {
        		event: function(e){
        			this.set('currentType', 0); 
        				this.addSheetShow(false);
        		}
        	},
           	'remove-show': {
                event: function(e){
                       var sheetid = e.target.getData('id');
                       this.template.toggleView(true, 'rowSheet.removegroup-' + sheetid, 'rowSheet.remove-' + sheetid);
                   }
            },
            'remove-cancel': {
            	event: function(e){
                       var sheetid = e.target.getData('id');
                       this.template.toggleView(false, 'rowSheet.removegroup-' + sheetid, 'rowSheet.remove-' + sheetid);
                   }
            },
            changeCourse: {
            	event: function(e){
            		var numCourse = e.target.getData('value'),
            			tp = this.template;
            		
            			tp.setValue('groupRenderItem.inpCourse', numCourse);
            			tp.removeClass('groupRenderItem.divCourse', 'open');
            			tp.setHTML('tablMark', '');
            			this.set('currentCourse', numCourse);
            			this.set('currentSheet', 0);
        				this.set('currentAttProc', '');
	            			this.reqSheetList();
            	}
            },
        	addSemestr: {
        		event: function(e){
        			var valCurSem = e.target.getData('value'),
        				tp = this.template;
        			
        			tp.toggleView(false,'markPanel' ,'sheetPanel');
        			tp.gel('groupRenderItem.inpSemestr').value = e.target.getHTML();
        			tp.removeClass('groupRenderItem.divSemestr', 'open');
        			tp.setHTML('tablMark', '');
        				this.set('currentSemestr', valCurSem);
        				this.set('currentSheet', 0);
        				this.set('currentAttProc', '');
        					this.reqSheetList();
        		}
        	},
        	addSubject: {
        		event: function(e){
        			var subjectid = e.target.getData('id'),
        				tp = this.template;
        			
        			tp.removeClass('rowAddSheet.divSubject', 'open');
        			tp.setValue('rowAddSheet.inpSubject', e.target.getHTML());
        				this.set('currentSubject', subjectid);
        		}
        	},
        	saveAddSheet: {
        		event: function(e){
        			this.actSheet();
        		}
        	},
        	saveEditSheet: {
        		event: function(e){
        			this.actSheet(e.target.getData('id'));
        		}
        	},
        	removeSheet: {
        		event: function(e){
        			var sheetid = e.target.getData('id');
        				this.removeSheet(sheetid);
        		}
        	},
        	editSheet: {
        		event: function(e){
        			var sheetid = e.target.getData('id');
        				this.editSheet(sheetid, e.target.getDOMNode().parentNode.parentNode);
        		}
        	},
        	showMark: {
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				idSheet = targ.getData('id'),
        				attProc = targ.getData('att'),
        				groupItem = this.get('groupItem'),
        				obj = {
        					subj: targ.getData('ns'),
        					formControl: targ.getData('formControl'),
        					frmStudy: groupItem.get('frmstudy'),
        					fio: targ.getData('fio')
        				};
        			
        			this.set('currentIdSheet', idSheet);
        			this.set('currentAttProc', attProc);
        			tp.toggleView(true, 'markPanel' ,'sheetPanel');
        			
        			this.reqMarkList(obj);
        		}
        	},
        	cancelMark: {
        		event: function(e){
        			var tp = this.template;
        			tp.toggleView(false, 'markPanel', 'sheetPanel');
        			tp.setHTML('tablMark', '');
        				this.set('currentIdSheet', 0);
        				this.set('currentAttProc', '');
        				this.reqSheetList();
        		}
        	},
        	changeMarkZaoch: {
        		event: function(e){
    				var tp = this.template,
    					targ = e.target,
    					idMark = targ.getData('id'),
    					value = targ.getData('value'),
    					text = targ.getDOMNode().innerHTML,
    					inp = 'rowMarkStudZaoch.markZaoch-',
    					div = 'rowMarkStudZaoch.divMark-';
    				
    				tp.setValue(inp+idMark, text);
    				tp.removeClass(div+idMark, 'open');
    				
    					this.markZaochUpdate(idMark, value);
		        }
        	},
        	close: {
        		event: function(e){
        			this.go('managerGroups.view');
        		}
        	},
        	print: {
        		event: function(e){
        			console.log(this.get('currentIdSheet'));
        		}
        	}
        }
    });

    NS.SheetEditorWidget.parseURLParam = function(args){
        return {
        	groupid: args[0]
        };
    };
};