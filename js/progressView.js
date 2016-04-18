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
	    					this.set('mark', result.markListStat);
	    					this.set('markProj', result.markListStatProj);
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
        			var namesubject = subject.get('namesubject'),
        				subjectid = subject.get('id'),
        				project = subject.get('project');
        			
	    				lstTh += this.replaceTh(namesubject);
	    				lstMarkTd += this.replaceTd(subjectid, 0);
	    				
	        			if(project.indexOf('1') !== -1){
	        				var arr = project.split(','),
	        					title = "";
	        				
	        				if(arr[0] == 1){
	        					title = " (Курсовая работа)";
	        				} else if(arr[1] == 1){
	        					title = " (Курсовой проект)";
	        				}
		        				lstTh += this.replaceTh(namesubject + title);
		        				
			    	    		lstMarkTd += this.replaceTd(subjectid, 1);
	        			} 
        		}, this);
        		
        		tp.setHTML('groupInfo.markTable', tp.replace('markTable', {
        			th: lstTh,
        			rows: this.renderStudList(lstMarkTd)
        		}));
        			this.renderMarkListStat();
        },
        replaceTh: function(namesubject){
        	return this.template.replace('markSubj', {
				namesubject: namesubject
			});
        },
        replaceTd: function(subjectid, proj){
        	return this.template.replace('markTd', {
        		id: subjectid,
        		proj: proj
			});
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
        	var markList = this.get('mark'),
        		tp = this.template,
        		idRow = 'rowMarkTable.stud-';
        		
        	
        	markList.each(function(mark){
        		var id = idRow + mark.get('studid'),
        			row = tp.one(id);
        		
	        		if(row){
	        			var tdRow = row.getDOMNode().cells,
	        				len = tdRow.length,
	        				mk = mark.get('mark');
	        			
		        		for(var i = 3; i < len; i++){
		        			if(tdRow[i].dataset.proj == 0){
			        			if(tdRow[i].id == mark.get('subjectid')){
			        				this.validMark(tdRow[i], mk);
			        					break;
			        			}
		        			} else {
		        				this.renderMarkProj(tdRow[i], mark.get('studid'));
		        			}
		        		}
	        		}
        	}, this);
        },
        renderMarkProj: function(tdRow, studid){
        	var markList = this.get('markProj'),
        		lib = this.get('appInstance'),
        		view = this.get('view');
        	
        	markList.each(function(mark){
        		var mk = mark.get('mark'),
        			curStudid = mark.get('studid');
        		
        		if(tdRow.id == mark.get('subjectid') && curStudid == studid){
        			this.validMark(tdRow, mk);
    					return;
        		}
        	}, this);
        },
        validMark: function(tdRow, mk){
        	var view = this.get('view'),
        		lib = this.get('appInstance');	
        	
			if(mk < 51 || mk === 101){
				tdRow.classList.add('danger');
			}
			
			tdRow.innerHTML = view == 1 ? lib.setTradMark(mk) : mk;
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
            mark: {value: null},
            studList: {value: null},
            view: {value: null},
            markProj: {value: null}
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