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
        reloadList: function(callback){
        	var data = {
        		sheetid: this.get('sheetid'),
        		mark: true
        	};
        	
        	if(callback){
        		this.set('callback', callback);
        	}
        	
	        	this.set('waiting', true);
		        	this.get('appInstance').sheetItem(data, function(err, result){
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
        		formcontrol = sheetItem.get('formcontrol'),
        		project = sheetItem.get('project'),
        		tp = this.template,
        		num = 0,
        		lst = "";
        	
		    	markList.each(function(mark){
		    		var markValue = mark.get('mark'),
		    			success = this.setSuccess(markValue);
		    		
						if(formcontrol === 'Зачет' && sheetItem.get('type') < 3){
							markValue = markValue === 102 ? 'Зач' : 'Незач'
						} 
					
			    		lst += tp.replace('row', [{
			    			n: ++num,
			    			cl: success ? "class='success'" : '',
			    			mark: markValue
			    		}, mark.toJSON()]);
		    	}, this);
		    	
		    	tp.setHTML('modal.mark', tp.replace('table', {
			    		rows: lst,
			    		a1: arrAttest[0],
			    		a2: arrAttest[1],
			    		a3: arrAttest[2]
		    		})
		    	);
		    	
		    	this.set('attestation', arrAttest);
        },
        setSuccess: function(mark){
        	return mark === 102 || mark >= 51 && mark <= 100;
        },
        change: function(e){
    		var targ = e.target,
    			input = targ.getDOMNode(),
    			view = targ.getData('view'),
    			row;
    		
				if(!this.checkInp(input.value)){
	    			input.value = 0;
				}
				row = input.parentNode.parentNode;
				
				switch(view){
					case 'debts':
						this.reqMark(this.parseRowPoint(row.id, row.cells));
							break;
					case 'att0':
						this.setAttestaion(input.value, 0);
							break;
					case 'att1':
						this.setAttestaion(input.value, 1);
							break;
					case 'att2':
						this.setAttestaion(input.value, 2);
							break;
					default:
						if(this.checkAttestation() !== 100){
							alert( 'Вес аттестации должен быть равен 100' );
								input.value = input.getAttribute('value');
						} else {
							this.calcMark(row);
						}
				}
		},
		calcMark: function(row){
			var sheetItem = this.get('sheetItem'),
				cells = row.cells,
				arrAttest = this.get('attestation');
				objPoint = this.parseRowPoint(row.id, cells),
				result = Math.round( 
						(arrAttest[0] * objPoint.firstatt) / 100 + 
						(arrAttest[1] *  objPoint.secondatt) / 100 + 
						(arrAttest[2] * objPoint.thirdatt) / 100 
				),
				mark = result + objPoint.additional;
				
				objPoint.prliminary = result;
				cells[6].firstChild.textContent = result;
				
				if(mark > 100){
					alert( 'Сумма баллов больше 100!' );
					cells[7].firstChild.value = 0;
						objPoint.additional = 0;
							mark = result;
				}
				
				cells[9].firstChild.textContent = this.isCredit(mark);
				
				if(this.setSuccess(mark)){
					row.classList.add('success');
				} else {
					row.classList.remove('success');
				}
				
				this.reqMark(objPoint);
	    },
	    isCredit: function(mark){
	    	var sheetItem = this.get('sheetItem'),
	    		formcontrol = sheetItem.get('formcontrol'),
	    		project = sheetItem.get('project');
	    	
				if(formcontrol === 'Зачет' && sheetItem.get('type') < 3){
					mark = mark >= 51 ? 'Зач' : 'Незач';
				} 
				return mark;
	    },
	    parseRowPoint: function(id, cells){
		    	return {
		    		id: id,
		    		sheetid: this.get('sheetid'),
		    		firstatt: +cells[3].firstChild.value,
	        		secondatt: +cells[4].firstChild.value,
	        		thirdatt: +cells[5].firstChild.value,
	        		prliminary: +cells[6].firstChild.textContent,
	        		additional: +cells[7].firstChild.value,
	        		debts: +cells[8].firstChild.value
		    	};
	    },
        reqMark: function(data){
	        this.set('waiting', true);
	        	this.get('appInstance').markUpdate(data, function(err, result){
	        		this.set('waiting', false);
	        	}, this);
        },
        setAttestaion: function(value, ind){
        	var attestation = this.get('attestation'),
        		sumProc = this.template.gel('table.sumProc'),
        		sum = 0;
        	
        		attestation[ind] = value;
        		
        		this.set('attestation', attestation);
        		
        		sum = this.checkAttestation();
        		
        		sumProc.textContent = sum;
        		
        		if(sum !== 100){
        			sumProc.classList.add('label-danger');
        		} else {
        			sumProc.classList.remove('label-danger');
        			this.updateWeightAttestation();
        		}
        },
        checkAttestation: function(){
        	var attestation = this.get('attestation');
        		
        		for(var i = 0, sum = 0; i < 3; i++){
        			sum += +attestation[i];
        		}
        		return sum;
        },
        updateWeightAttestation: function(){
        	var data = {
        			sheetid: this.get('sheetid'),
        			attProc: this.get('attestation')
        		}; 
        	
		        this.set('waiting', true);
		        	this.get('appInstance').updateWeight(data, function(err, result){
		        		this.set('waiting', false);
		        			if(result.updateWeight){
		        				this.reqMarkList();
		        			}
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
            markList: {value: null},
            attestation: {value: null},
            callback: {value: ''}
        },
        CLICKS: {
        	closeModal: {
        		event: function(){
        			var callback = this.get('callback');
	        			
	        			if(callback){
	        				callback();
	        			}
	        			this.template.setHTML('modal', '');
        		}
        	},
        	print: {
        		event: function(e){
        			var targ = e.target,
        				url = '/recordbook/print/' + targ.getData('id') + "/" + targ.getData('type');
        			
        				this.get('appInstance').printSheet(url, 'recordbookPrint');
        		}
        	}
        }
    });
};