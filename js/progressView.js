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

    NS.ProgressViewWidget = Y.Base.create('progressViewWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var groupid = this.get('groupid');
        	
          	this.set('waiting', true);
	          	appInstance.groupItem(groupid, function(err, result){
	    			this.set('waiting', false);
	    				this.set('groupItem', result.groupItem);
	    					this.renderGroup();
	    		}, this);
        },
        destructor: function(){
        	
        },
        renderGroup: function(){
        	var groupItem = this.get('groupItem'),
        		tp = this.template;
        	
        	tp.setHTML('groupInfo', tp.replace('groupInfo', [groupItem.toJSON()]));
        	
        	this.set('course', groupItem.get('numcrs'));
        },
        renderDropdown: function(value, name){
        	var tp = this.template,
        		view = this.get('view');
        	
				tp.setValue('groupInfo.inp_'+name, value);
				tp.removeClass('groupInfo.div_'+name, 'open');
				
				this.set(name, value);
					if(view){
						this.reqSubjectList();
					}
        },
        reqSubjectList: function(){
        	var group = this.get('groupItem'),
        		data = {
        			fieldid: group.get('fieldid'),
        			numcrs: this.get('course'),
        			groupid: this.get('groupid'),
        			view: this.get('view'),
        			from: 'progressViewWidget'
        		},
        		semestr = this.get('semestr');
        	
        	if(semestr){
        		data.semestr = semestr === 'осенний' ? 1 : 2;
        	} else {
        		alert( 'Укажите семестр' );
        		return;
        	}
        	
        	if(!data.view){
        		return;
        	}
        	
          	this.set('waiting', true);
	          this.get('appInstance').markListStat(data, function(err, result){
	    			this.set('waiting', false);
	    				if(!err){
	    					this.set('subjectList', result.subjectList);
	    					this.set('markListStat', result.markListStat);
	    					this.set('studList', result.studList);
	    						
	    						this.renderTable();
	    				}
	          }, this);
        },
        renderTable: function(){
        		var subjectList = this.get('subjectList'),
        			tp = this.template,
        			view = this.get('view'),
        			lstTh = "",
        			lstMarkTd = "";
        		
 				if(view == 2){
					lstTh += tp.replace('ratingTh');
					lstMarkTd += tp.replace('ratingTd');
				}
        		
        		subjectList.each(function(subject){
        				
	        			lstTh += tp.replace('markSubj', {
	        				namesubject: subject.get('namesubject')
	        			});
	        			
	    	    		lstMarkTd += tp.replace('markTd', {
	    	    		      id: subject.get('id')
	    	    		});
        		}, this);
        		
        		tp.setHTML('groupInfo.markTable', tp.replace('markTable', {
        			th: lstTh,
        			rows: this.renderStudList(lstMarkTd)
        		}));
        			this.renderMarkListStat();
        },
        renderStudList: function(lstMarkTd){
        	var studList = this.get('studList'),
        		tp = this.template,
        		lstTd = "",
        		countStud = 0;
        	
        		studList.each(function(stud){
        			lstTd += tp.replace('rowMarkTable', [{
        				n: ++countStud,
        				studid: stud.get('id'),
        				td: lstMarkTd
        			}, stud.toJSON()]);
        		}, this)
        		
        		return lstTd;
        },
        renderMarkListStat: function(){
        	var markListStat = this.get('markListStat'),
        		tp = this.template,
        		view = this.get('view'),
        		idRow = 'rowMarkTable.stud-',
        		lib = this.get('appInstance');
        	
        	markListStat.each(function(mark){
        		var id = idRow + mark.get('studid'),
        			row = tp.one(id);
        		
	        		if(row){
	        			var tdRow = row.getDOMNode().cells,
	        				len = tdRow.length,
	        				mk = mark.get('mark');
	        			
		        		for(var i = 3; i < len; i++){
		        			if(tdRow[i].id == mark.get('subjectid')){
		        				if(mk < 51 || mk === 101){
		        					tdRow[i].classList.add('danger');
		        				}
		        				
		        				tdRow[i].innerHTML = view == 1 ? lib.setTradMark(mk) : mk;
		        					break;
		        			}
		        		}
	        		}
        	}, this);
        },
        lightRow: function(rowIndex, cellIndex){
        	var tp = this.template,
        		table = tp.gel('markTable.markTable'),
        		rows = table.rows,
        		rowLen = rows.length,
        		cellLen = rows[0].cells.length;
        	
        	for(var i = 0; i < rowLen; i++){
        		for(var j = 0; j < cellLen; j++){
        			if(i == rowIndex && j <= cellIndex){
        				rows[i].cells[j].classList.add('success');
        			} else {
        				rows[i].cells[j].classList.remove('success');
        			}
	        	}
	        		if(i < rowIndex){
	        			rows[i].cells[cellIndex].classList.add('success');
	        		}
        	}
        },
        setPrimary: function(id){
        	this.template.addClass('groupInfo.'+id, 'btn-primary');
        },
        removePrimary: function(id){
        	this.template.removeClass('groupInfo.'+id, 'btn-primary');
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,groupInfo,markTable,markSubj,rowMarkTable,markTd,ratingTh,ratingTd'},
            groupid: {value: 0},
            groupItem: {value: null},
            course: {value: 0},
            semestr: {value: null},
            subjectList: {value: null},
            markListStat: {value: null},
            studList: {value: null},
            view: {value: null}
        },
        CLICKS: {
        	close:{
        		event: function(){
        			this.go('managerGroups.view');
        		}
        	},
        	choiceCourse: {
        		event: function(e){
        			var a = e.target.getDOMNode();
        			
        			if(!a.href){
        				return;
        			}
        			
        			this.renderDropdown(a.textContent, 'course');
        		}
        	},
        	choiceSemestr: {
        		event: function(e){
        			var a = e.target.getDOMNode();
        			
        			if(!a.href){
        				return;
        			}
        			
        			this.renderDropdown(a.textContent, 'semestr');
        		}
        	},
        	choiceViewStat: {
        		event: function(e){
        			var view = e.target.getData('view'),
        				tp = this.template;
        			
        			if(view == 1){
        				this.setPrimary('view1');
        				this.removePrimary('view2');
        			} else {
        				this.setPrimary('view2');
        				this.removePrimary('view1');
        			}
        			this.set('view', view);
        			this.reqSubjectList();
        		}
        	},
        	lightRow: {
        		event: function(e){
        			var targ = e.target,
        				node = targ.getDOMNode();
        			
        			if(targ.hasClass('td-mark')){
        				this.lightRow(node.parentNode.sectionRowIndex + 1, node.cellIndex);
        			}
        		}
        	}
        }
    });

    NS.ProgressViewWidget.parseURLParam = function(args){
        return {
        	groupid: args[0]
        };
    };
};