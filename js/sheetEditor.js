var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js', 'departManager.js']}
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
        	var tp = this.template,
        		self = this;
        	
        		this.paginator = new NS.PaginationCourseWidget({
                    srcNode: tp.gel('pag'),
                    show: true,
                    callback: function(){
                    	self.showSheetAddPanel();
                    	self.reqSheetList();
                    }
        		});
        		
	        	this.get('boundingBox').on('change', this.change, this);
        },
        destructor: function(){
        	if(this.paginator){
        		this.paginator.destroy();
        	}
        	
        	if(this.departManager){
        		this.departManager.destroy();
        	}
        },
        initDepartManager: function(){
        	if(this.departManager){
        		this.departManager.destroy();
        	}
        	
    		this.departManager = new NS.DepartManagerWidget({
    			srcNode: this.template.gel('departModal.departList'),
    			isActSheet: true
    		});
        },
        showSheetAddPanel: function(){
        	var tp = this.template;
        		if(!this.get('sheetList')){
            		tp.setHTML('sheetAddPanel', tp.replace('sheetAddPanel'));
        		}
        },
        reqSheetList: function(){
        	var data = {
    			groupid: this.get('groupid'),
        		currentSemestr: this.paginator.get('semestr'),
        		numcrs: this.paginator.get('course'),
        		fieldid: this.get('fieldid')
        	};
        	
        	this.set('waiting', true);
	        	this.get('appInstance').sheetList(data, function(err, result){
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
	        		 case 1:  
	        			 type = 'label-success';
	        			 	break;
	        		 case 2: 
	        			 type = 'label-info';
	        		 		break;
	        		 case 3: 
	        			 type = 'label-warning';
	        		 		break;
	        		 case 4: 
	        			 type = 'label-primary';
     		 				break;
        		}
        		
        		lst += tp.replace('rowSheet', [{
        			date: Brick.dateExt.convert(sheet.get('date'), 2),
        			typeClass: type,
        			isRemove: sheet.get('remove') ? tp.replace('label') : ''
        		}, sheet.toJSON()]);
        	});
        	tp.setHTML('listSheet', tp.replace('tableSheet', {rows: lst}));
        },
        addSheetShow: function(show){
        	var tp = this.template,
        		lst = "",
        		element = 'tableSheet.rowAddSheet';
        		
        		if(show){
        			tp.show(element);
        			tp.setHTML(element, tp.replace('rowAddSheet'));
        				this.reqListSubject();        			
        		} else {
        			tp.hide(element);
        			tp.setHTML(element, '');
        		}
        },
        reqListSubject: function(){
        	var groupItem = this.get('groupItem'),
        		data = {
        			numcrs: this.paginator.get('course'),
        			semestr: this.paginator.get('semestr'),
        			fieldid: this.get('fieldid'),
        			type: this.get('currentType'),
        			from: 'sheetEditorWidget'
        		};
        	
	        	this.set('waiting', true);
		        	this.get('appInstance').subjectList(data, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.set('subjectList', result.subjectList);
			        				this.renderListSubject();
			        		}
		        	}, this);
        },
        renderListSubject: function(){
        	var tp = this.template,
        		subjectList = this.get('subjectList'),
        		curType = this.get('currentType'),
        		lst = "";
        	
				subjectList.each(function(subject){
					lst += tp.replace('liSubject', [subject.toJSON()]);
				});
			
				tp.setHTML('rowAddSheet.divSubject', tp.replace('ulSubject', {
					li: lst
				}));
				
					if(curType == 2 || curType == 4){
						this.reqStudList();
	        		}
				
        },
        reqStudList: function(){
        	var groupid = this.get('groupid');
        	
				this.set('waiting', true);
					this.get('appInstance').studList(groupid, function(err, result){
						this.set('waiting', false);
							this.set('studList', result.studList);
								this.renderStudList();
					}, this);
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
        actSheet: function(id, blockName){
        	var tp = this.template,
        		valDate = tp.getValue(blockName+'.inpDate').split('-'),
        		stud = id ? 
        					tp.gel('rowEditSheet.studList').children :
        						tp.gel('rowAddSheet.studList').children,
        		arrStudId = [],
        		lib = this.get('appInstance'),
    			nameSubject = tp.gel(blockName+'.nameSubject').textContent;
    		
    		var type = this.get('currentType');
    		
        	if(type == 2 || type == 4){
            	for(var i = 0; i < stud.length; i++){
            		var id = stud[i].id;
    	        		if(id && stud[i].checked){
    	        			arrStudId.push(id);
    	        		}
            	}
        	}
			var data = {
	        			idSubject: this.get('currentSubject'),
	        			date: lib.getDate(valDate),//получить в мсек
	        			groupid: this.get('groupid'),
	        			idSheet: id,
	        			typeSheet: this.get('currentType'),
	        			arrStudId: arrStudId,
	        			teacherid: this.get('currentTeacher').id,
	        			isPractic: nameSubject.indexOf('Практика') !== -1 ? true : false
	        		};
			
				if(!nameSubject){
					alert('Укажите предмет');
						return false;
				}
				
	        	this.set('waiting', true);
	        	lib.sheetSave(data, function(err, result){
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
        	var arr = formControl.split('/'),
        		form = arr[0],
        		type = arr[1],
        		project = arr[2];
        	
        	if(type > 2){
        		if(project[0] == 1){
        			form = 'Курсовая работа';
        		} else if(project[2] == 1) {
        			form = 'Курсовой проект';
        		}
        	}
        	this.set('currentType', type);
        	return form;
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
	    		self = this,
	    		formControl = this.get('currentFormControl');
        	
		    	markList.each(function(mark){
		    		var markValue = mark.get('mark');
		    		
		    		if(formControl == 'Зачет'){
		    			markValue = markValue == 102 ? 'Зачтено' : 'Не зачтено'
		    		}
		    		
		    		lst += tp.replace('rowMarkStudOch', [{
		    			n: ++num,
		    			mark: markValue
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
        		danger = tp.gel('tableMarkOch.sumProc').className,
        		formControl = this.get('currentFormControl');
        			
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
        			
        			if(formControl == 'Зачет'){
        				resultAdd = this.calcTradMark(resultAdd);
        			}
        			
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
        calcTradMark: function(result){
        	return result >= 51 ? "Зачтено" : "Не зачтено";
        },
        calcMarkAdd: function(row){
        	var tp = this.template,
    			arrRow = row.cells,
    			a1 = +arrRow[6].firstChild.innerHTML,
    			a2 = +arrRow[7].firstChild.value,
    			sum = a1 + a2,
    			formControl = this.get('currentFormControl');
        	
        	if(sum > 100){
        		alert( 'Окончательная оценка c учетом доп баллов > 100' );
        			arrRow[7].firstChild.value = 0;
        				sum = a1;
        	}
        		arrRow[9].firstChild.innerHTML = formControl == 'Зачет' ? this.calcTradMark(sum) : sum;
				this.reqMark(this.parseRowData(row));
        },
        parseRowData: function(row){
        	var arrRow = row.cells,
        		formControl = this.get('currentFormControl'),
        		mark = arrRow[9].firstChild.innerHTML;
        	
        	if(formControl == 'Зачет'){
        		mark = arrRow[9].firstChild.innerHTML == 'Зачтено' ? 102 : 101;
        	} 
        	var objData = {
	        		id: row.id,
	        		firstatt: arrRow[3].firstChild.value,
	        		secondatt: arrRow[4].firstChild.value,
	        		thirdatt: arrRow[5].firstChild.value,
	        		prliminary: arrRow[6].firstChild.innerHTML,
	        		additional: arrRow[7].firstChild.value,
	        		debts: arrRow[8].firstChild.value,
	        		mark: mark
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
        		case 101: return 'не явка';
        		case 102: return 'зачтено';
        		case 103: return 'удовлетворительно';
        		case 104: return 'хорошо';
        		case 105: return 'отлично';
        		default: return '';
        	}
        },
        checkInp: function(val){
        	if(!this.get('appInstance').isNumeric(val)){
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
        printShow: function(idSheet, type){
        	var id = idSheet ? idSheet : this.get('currentIdSheet'),
        		type = type ? type : this.get('currentType'),
        		url = '/recordbook/print/' + id + "/" + type,
        		printWin = window.open(url, 'recordbookPrint', 'width=1050,height=800');
            	
        	printWin.focus();
        },
        parseTeacher: function(){
        	var currentTeacher = this.get('currentTeacher');
        	
        	this.template.setHTML('rowAddSheet.teacher', currentTeacher.fio);
        	
        	
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {
            	value: 'widget, sheetAddPanel, label, tableSheet, departModal, rowStud, rowSheet, rowAddSheet, liSubject, ulSubject, rowEditSheet, tableMarkStud, tableMarkOch, rowMarkStudOch, tableMarkZaoch, rowMarkStudZaoch, tradMark, tradZachet'
            },
            groupid: {value: 0},
            fieldid: {value: 0},
            sheetList: {value: null},
            subjectList: {value: null},
            currentSubject: {value: 0},
            markList: {value: null},
            currentIdSheet: {value: 0},
            currentAttProc: {value: ''},
            currentType: {value: 0},
            studList: {value: null},
            currentFormControl: {value: null},
            currentTeacher: {value: ''}
        },
        CLICKS: {
        	'addSheet-show': {
        		event: function(e){
        			var targ = e.target,
        				button = targ.getDOMNode();
        			
        			if(!button.type){
        				return;
        			}
        			
        			this.set('currentType', targ.getData('type')); 
        				this.addSheetShow(true);
        				this.set('addFlag', true);	
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
        	addSubject: {
        		event: function(e){
        			var subjectid = e.target.getData('id'),
        				tp = this.template;
        			
        			if(!subjectid){
        				return;
        			}
        			tp.removeClass('rowAddSheet.divSubject', 'open');
        			
        			tp.setHTML('rowAddSheet.nameSubject', e.target.getHTML());
        				this.set('currentSubject', subjectid);
        		}
        	},
        	saveAddSheet: {
        		event: function(e){
        			this.actSheet(0, 'rowAddSheet');
        		}
        	},
        	saveEditSheet: {
        		event: function(e){
        			this.actSheet(e.target.getData('id'), 'rowEditSheet');
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
        			
        			this.set('currentFormControl', this.parseFormControl(obj.formControl));
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
        			var idSheet = e.target.getData('id'),
        				type = e.target.getData('type');
        			
        				this.printShow(idSheet, type);
        		}
        	},
        	'depart-modal-show': {
        		event: function(e){
        			var tp = this.template;
        			
        			tp.setHTML('rowAddSheet.departModal', tp.replace('departModal'));
        			this.initDepartManager();
        			
        			this.departManager.reloadList();
        		}
        	},
        	'depart-modal-hide': {
        		event: function(e){
        			var tp = this.template;
        			
        			tp.setHTML('rowAddSheet.departModal', "");
        		}
        	},
        	'choice-teacher': {
        		event: function(){
        			var currentTeacher = this.departManager.teacherWidget.get('currentTeacher'); 
        			
        			if(currentTeacher){
        				this.set('currentTeacher', currentTeacher);
        				this.template.setHTML('rowAddSheet.departModal', "");
        				
        				this.parseTeacher();
        			} else {
        				alert( 'Необходимо выбрать преподавателя' );
        			}
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