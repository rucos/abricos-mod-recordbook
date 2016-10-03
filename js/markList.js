var Component = new Brick.Component();
console.log();
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
    
 
    NS.MarkListWidget = Y.Base.create('markListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	this.get('boundingBox').on('change', this.change, this);
        },
        reloadList: function(){
        	var sheetid = this.get('sheetid');
        	
	        	this.set('waiting', true);
		        	this.get('appInstance').sheetItem(sheetid, true, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.set('sheetItem', result.sheetItem);
			        				this.renderList();
			        				this.reqMarkList();
			        		}
		        	}, this);
        },
        renderList: function(){
        	var sheetItem = this.get('sheetItem').toJSON(),
        		tp = this.template;

        		sheetItem.formcontrol = this.parseFormControl();

        		tp.setHTML('modal', tp.replace('modal', sheetItem));
        },
        parseFormControl: function(){
        	var sheetItem = this.get('sheetItem'),
        		type = sheetItem.get('type'),
        		formControl = sheetItem.get('formcontrol'),
        		project = sheetItem.get('project');
        	
	        	if(type > 2){
	        		if(+project[0]){
	        			formControl = 'Курсовая работа';
	        		} else if(+project[2]) {
	        			formControl = 'Курсовой проект';
	        		}
	        	}
	        	return formControl;
        },
        reqMarkList: function(){
        	var sheetid = this.get('sheetid');
        	
	        	this.set('waiting', true);
	        	this.get('appInstance').markList(sheetid, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.set('markList', result.markList);
		        				this.renderMarkList();
		        		}
	        	}, this);
        },
        renderMarkList: function(){
        	var markList = this.get('markList'),
        		sheetItem = this.get('sheetItem'),
        		arrAttest = sheetItem.get('attestation'),
        		tp = this.template,
        		num = 0,
        		lst = "";
        	
		    	markList.each(function(mark){
		    		var markValue = mark.get('mark');
		    		
			    		if(sheetItem.get('formcontrol') == 'Зачет'){
			    			markValue = markValue == 102 ? 'Зачтено' : 'Не зачтено'
			    		}
			    		
			    		lst += tp.replace('row', [{
			    			n: ++num,
			    			mark: markValue
			    		}, mark.toJSON()]);
		    	});
		    	
		    	tp.setHTML('modal.mark', tp.replace('table', {
			    		rows: lst,
			    		a1: arrAttest[0],
			    		a2: arrAttest[1],
			    		a3: arrAttest[2]
		    		})
		    	); 
        },
        change: function(e){
    		var idMap = this.template.idMap,
	    		table = idMap.table,
				row = idMap.row,
				input = e.target.getDOMNode();
    		
    		
			switch(input.id){
//				case tpTblMark.inpAtt1: 
//					if(this.checkAtt(input, 0)){
//							this.udpateSheet();
//								this.reCalcMarkTable();
//					}
//						break;
//				case tpTblMark.inpAtt2: 
//					if(this.checkAtt(input, 1)){
//							this.udpateSheet();
//								this.reCalcMarkTable();
//					}
//						break;
//				case tpTblMark.inpAtt3: 
//					if(this.checkAtt(input, 2)){
//							this.udpateSheet();
//								this.reCalcMarkTable();
//					}
//						break;
				case row.firstatt:
				case row.secondatt:
				case row.thirdatt:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.calcMark(input.parentNode.parentNode, true);
					break;
				case row.additional:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.calcMarkAdd(input.parentNode.parentNode);
					break;
				case row.debts:
					if(!this.checkInp(input.value)){
	        			input.value = 0;
					} 
						this.reqMark(this.parseRowData(input.parentNode.parentNode));
					break;
			}
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
        reqMark: function(objData){
	        	this.set('waiting', true);
	        	this.get('appInstance').markUpdate(objData, function(err, result){
	        		this.set('waiting', false);
	        	}, this);
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
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, modal, table, row'},
            sheetid: {value: 0},
            sheetItem: {value: null},
            markList: {value: null}
        },
        CLICKS: {
        	closeModal: {
        		event: function(){
        			this.template.setHTML('modal', '');
        		}
        	}
        }
    });
};