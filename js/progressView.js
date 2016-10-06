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

        },
        destructor: function(){
        	
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
	    					this.set('markList', result.markListStat);
	    					this.set('markListProj', result.markListStatProj);
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
        			
        				if(subject.get('formcontrol') != '-'){
            				lstTh += this.replaceTh(namesubject);
    	    				lstMarkTd += this.replaceTd(subjectid, 0);
        				}
	    				
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
        			this.renderMarkList('markList', 0);
        			this.renderMarkList('markListProj', 1);
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
        renderMarkList: function(attr, proj){
        	var markList = this.get(attr),
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
		        			if(tdRow[i].dataset.proj == proj){
			        			if(tdRow[i].id == mark.get('subjectid')){
			        				this.validMark(tdRow[i], mk);
			        					break;
			        			}
		        			} 
		        		}
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
        },
        printShow: function(){
        	var groupid = this.get('groupid'),
            	course = this.get('course'),
            	semestr = this.get('semestr') === 'осенний' ? 1 : 2,
            	url = '/recordbook/print_progress/' + groupid + "/" + course + "/" + semestr,
            	printWin = window.open(url, 'recordbookPrint_progress', 'width=1250,height=800');
                	
            	printWin.focus();
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,markTable,markSubj,rowMarkTable,markTd,ratingTh,ratingTd'},
            groupid: {value: 0},
            subjectList: {value: null},
            markList: {value: null},
            studList: {value: null},
            view: {value: null},
            markListProj: {value: null}
        },
        CLICKS: {
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
        	},
        	print: {
        		event: function(e){
        			var semestr = this.get('semestr');
        			if(semestr){
        				this.printShow();
        			} else {
        				alert('Укажите семместр');
        			}
        		}
        	}
        }
    });
};