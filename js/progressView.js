var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ProgressViewWidget = Y.Base.create('progressViewWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var self = this;
        	
	    		this.paginator = new NS.PaginationCourseWidget({
	                srcNode: this.template.gel('pag'),
	                show: true,
	                callback: function(){
	                	self.markListStat();
	                }
	    		});
        },
        destructor: function(){
        	if(this.paginator){
        		this.paginator.destroy();
        	}
        },
        markListStat: function(){
        	var data = {
        			fieldid: this.get('fieldid'),
        			numcrs: this.paginator.get('course'),
        			semestr: this.paginator.get('semestr'),
        			groupid: this.get('groupid'),
        			view: this.get('view'),
        			from: 'progressViewWidget'
        		};
        	
        	if(!data.numcrs){
        		alert( 'Укажите курс' );
        			return;
        	} else if(!data.semestr){
        		alert( 'Укажите семестр' );
        			return;
        	} else if(!data.view){
    				return;
        	}
        		this.reqMarkListStat(data);
        },
        reqMarkListStat: function(data){
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
        		
        		tp.setHTML('markTable', tp.replace('markTable', {
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
        setPrimary: function(v){
        	this.template.addClass('view' + v, 'btn-primary');
        },
        removePrimary: function(){
        	var tp = this.template,
        		cl = 'btn-primary';
        	
        		tp.removeClass('view1', cl);
        		tp.removeClass('view2', cl);
        },
        printShow: function(numcrs, semestr){
        	var url = '/recordbook/print_progress/' + this.get('groupid') + "/" + numcrs + "/" + semestr;
        	
        		this.get('appInstance').printSheet(url, 'recordbookPrint_progress');
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,markTable,markSubj,rowMarkTable,markTd,ratingTh,ratingTd'},
            groupid: {value: 0},
            fieldid: {value: 0},
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
        			
	        			this.removePrimary();
	        			this.setPrimary(view);
	
	        			this.set('view', view);
	        				this.markListStat();
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
        			var numcrs = this.paginator.get('course'),
        				semestr = this.paginator.get('semestr');
        			
                	if(!numcrs){
                		alert( 'Укажите курс' );
                			return;
                	} else if(!semestr){
                		alert( 'Укажите семестр' );
                			return;
                	}
                	
                	this.printShow(numcrs, semestr);
        		}
        	}
        }
    });
};