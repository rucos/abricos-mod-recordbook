var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js', 'departManager.js', 'markList.js']}
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
        		
        		this.markList = new NS.MarkListWidget({
        			srcNode: tp.gel('markList')
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
        	
          	if(this.markList){
        		this.markList.destroy();
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
        		lst += this.renderSheetItem(sheet.toJSON());
        	}, this);
        	tp.setHTML('listSheet', tp.replace('tableSheet', {rows: lst}));
        },
        renderSheetItem: function(obj){
        	var tp = this.template;
        	
	       		switch(obj.type){
			   		 case 1:  
			   			 obj.type = 'label-success';
			   			 	break;
			   		 case 2: 
			   			 obj.type = 'label-info';
			   		 		break;
			   		 case 3: 
			   			 obj.type = 'label-warning';
			   		 		break;
			   		 case 4: 
			   			 obj.type = 'label-primary';
				 				break;
				}
        		
	       		return tp.replace('rowSheet', [{
    					date: Brick.dateExt.convert(obj.date, 2),
    					isRemove: obj.remove ? tp.replace('label') : ''
    				}, obj]) 
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
        		sheetItem = this.get('sheetItem'),
        		arrstud = '',
        		lst = "";
        	
	    		if(sheetItem){
	    			arrstud = sheetItem.toJSON().arrstudid.toString();
	    		}
	    		
	        	studList.each(function(stud){
	        		var replObj = {
	        			ch: ~arrstud.indexOf(stud.get('id')) ? 'checked' : ''
	        		};
	       
	        		lst += tp.replace('rowStud',[replObj, stud.toJSON()]);
	        	});
	        	tp.setHTML('rowAddSheet.studList', lst);
        },
        actSheet: function(id){
        	var tp = this.template,
        		valDate = tp.getValue('rowAddSheet.inpDate'),
    			nameSubject = tp.gel('rowAddSheet.nameSubject').textContent,
    			type = this.get('currentType'),
    			data = {
	        			idSubject: this.get('currentSubject'),
	        			date: Date.parse(valDate) / 1000,
	        			groupid: this.get('groupid'),
	        			idSheet: id,
	        			typeSheet: type,
	        			arrStudId: !(type % 2) ? this.getStudList() : [], //если дополнительная ведомость => список студентов
	        			teacherid: this.get('currentTeacher').id,
	        			isPractic: nameSubject.indexOf('Практика') !== -1 ? true : false
	        	};
        	
        		if(data.idSubject === 0 && id == 0){
					alert( 'Укажите предмет' );
						return;
        		}
        		if(!data.teacherid){
					alert( 'Необходимо выбрать преподавателя' );
						return;
        		}
        		if(!(type % 2)){
        			if(data.arrStudId.length == 0){
    					alert( 'Необходимо выбрать хотя бы одного студента' );
							return;
        			}
        		}
				
				this.sheetSave(data);
        },
        getStudList: function(){
        	var tp = this.template,
        		studList = tp.gel('rowAddSheet.studList').children,
        		arrStudId = [];
        
	            	for(var i = 0, curid, len = studList.length; i < len; i++){
	            		curid = +studList[i].id;
	    	        		if(curid && studList[i].checked){
	    	        			arrStudId.push(curid);
	    	        		}
	            	}
          	
	          	return arrStudId;
        },
        reqSheetItem: function(sheetid){
        	this.set('waiting', true);
	        	this.get('appInstance').sheetItem(sheetid, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.set('sheetItem', result.sheetItem);
		        			this.editSheetShow(true);
		        		}
	        	}, this);
        },
        addSheetShow: function(show){
        	var tp = this.template,
        		lst = "",
        		element = 'tableSheet.rowAddSheet';
        		
        		if(show){
        			tp.show(element);
        			tp.setHTML(element, tp.replace('rowAddSheet', {
        				id: 0,
        				namesubject: '',
        				fio: '',
        				act: 'Добавить',
        				date: '',
        				formcontrol: ''
        			}));
        				this.reqListSubject();        			
        		} else {
        			tp.hide(element);
        			tp.setHTML(element, '');
        		}
        },
        editSheetShow: function(show){
        	var sheetItem = this.get('sheetItem').toJSON(),
        		tp = this.template,
        		id = sheetItem.id;
        	
        		if(show){
    	        	sheetItem.act = 'Изменить';
    	        	sheetItem.date = this.get('appInstance').setDate(Brick.dateExt.convert(sheetItem.date, 2));
    	        	
    	        	tp.setHTML('rowSheet.rowSheet-' + id, tp.replace('rowAddSheet', sheetItem));
    	        	
    	        	if(sheetItem.arrstudid){
    	        		this.reqStudList();
    	        	}
    	        	
    	        	
    	        	this.set('currentTeacher', {
    	        		id: sheetItem.teacherid
    	        	});
        		} else {
        			tp.one('rowSheet.rowSheet-' + id).getDOMNode().outerHTML = this.renderSheetItem(sheetItem);
        			this.set('sheetItem', null);
        		}
        },
        sheetSave: function(data){
           	this.set('waiting', true);
           	this.get('appInstance').sheetSave(data, function(err, result){
        		this.set('waiting', false);
	        		if(!err){
	        			this.reqSheetList();
	        			this.set('currentSubject', 0);
	        			this.set('currentType', 0);
	        			this.set('currentTeacher', '');
	        			this.set('sheetItem', null);
	        		}
        	}, this);
        },
        removeShow: function(show, id){
        	this.template.toggleView(show, 'rowSheet.removegroup-' + id, 'rowSheet.remove-' + id);
        },
        sheetRemove: function(id){
        	this.set('waiting', true);
        	this.get('appInstance').sheetRemove(id, function(err, result){
        		this.set('waiting', false);
        			if(!err){
        				this.reqSheetList();
        			}
        	}, this);
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
        	var data = {
        		idSheet: this.get('currentIdSheet'),
        		attProc: this.get('currentAttProc')
        	};
        	this.set('waiting', true);
	        	this.get('appInstance').updateWeight(data, function(err, result){
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
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {
            	value: 'widget, sheetAddPanel, label, tableSheet, departModal, rowStud, rowSheet, rowAddSheet, liSubject, ulSubject'
            },
            groupid: {value: 0},
            fieldid: {value: 0},
            sheetList: {value: null},
            subjectList: {value: null},
            currentSubject: {value: 0},
            currentType: {value: 0},
            studList: {value: null},
            currentTeacher: {value: ''},
            sheetItem: {value: null}
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
        			this.set('currentTeacher', '');
        				this.addSheetShow(true);
        		}
        	},
        	'editSheet-show': {
        		event: function(e){
        			var sheetid = e.target.getData('id'),
        				sheetItem = this.get('sheetItem');
        			
        				if(sheetItem){
        					this.editSheetShow();
        				}
        				
        				this.reqSheetItem(sheetid);
        		}
        	},
        	'cancel-sheet': {
        		event: function(e){
        			var id = +e.target.getData('id');
        			
        				this.set('currentType', 0); 
        				
        				if(id){
        					this.editSheetShow();
        				} else {
        					this.addSheetShow();        					
        				}
        		}
        	},
           	'remove-show': {
                event: function(e){
                       var id = e.target.getData('id');
                       
                       	this.removeShow(true, id);
                   }
            },
            'remove-cancel': {
            	event: function(e){
                       var id = e.target.getData('id');
                       
                       	this.removeShow(false, id);
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
        			var id = +e.target.getData('id');
        			
        				this.actSheet(id);
        		}
        	},
        	sheetRemove: {
        		event: function(e){
        			var id = e.target.getData('id');
        				this.sheetRemove(id);
        		}
        	},
        	showMark: {
        		event: function(e){
        			var id = e.target.getData('id');
        			
        			this.markList.set('sheetid', id);
        			this.markList.reloadList();
        			
//        			var tp = this.template,
//        				targ = e.target,
//        				idSheet = targ.getData('id'),
//        				attProc = targ.getData('att'),
//        				groupItem = this.get('groupItem'),
//        				obj = {
//        					subj: targ.getData('ns'),
//        					formControl: targ.getData('formControl'),
//        					frmStudy: groupItem.get('frmstudy'),
//        					fio: targ.getData('fio')
//        				};
//        			
//        			this.set('currentIdSheet', idSheet);
//        			this.set('currentAttProc', attProc);
//        			
//        			tp.toggleView(true, 'markPanel' ,'sheetPanel');
//        			
//        			this.set('currentFormControl', this.parseFormControl(obj.formControl));
//        			this.reqMarkList(obj);
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
        			var currentTeacher = this.departManager.teacherWidget.get('currentTeacher'),
        				tp = this.template;
        			
        			if(currentTeacher){
        				this.set('currentTeacher', currentTeacher);

        				tp.setHTML('rowAddSheet.departModal', "");
        	        	tp.setHTML('rowAddSheet.teacher', currentTeacher.fio);
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