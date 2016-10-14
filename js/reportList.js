var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js', 'markList.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.ReportListWidget = Y.Base.create('reportListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var self = this,
        		tp = this.template;

	        	this.pagination = new NS.PaginationCourseWidget({
	        		srcNode: tp.gel('pagCourse'),
	        		callback: function(){
	        			self.reloadMarkList();
	        		}
	        	});
	        	
	        	this.markList = new NS.MarkListWidget({
	        		srcNode: tp.gel('markList')
	        	});
        },
        destructor: function(){
            if (this.pagination){
                this.pagination.destroy();
            }
            if(this.markList){
            	this.markList.destroy();
            }
        },
        showReport: function(){
          	var value = this.get('findValue');
          	
           	if(!value){
        		alert( 'Введите ФИО студента или № зачетной книжки' );
        	} else {
        		this.showModal(true);
        		this.reqFind(value);
        	}
        },
        reqFind: function(value){
        	this.set('waiting', true);
        		this.get('appInstance').findStudReport(value, function(err, result){
        			var reportItem = result.findStudReport,
        				tp = this.template;
        			
	        			this.set('waiting', false);
		        			if(!err && reportItem.get('id')){
		        					this.set('oldGroups', result.groupList);
			        				this.set('reportItem', reportItem);
			        					this.renderGroupItem();
		        			} else {
		        				tp.setHTML('reportRenderItem', 'Студент не найден');
		        				this.pagination.hidePagination();
		        				tp.setHTML('groupList', '');
		                 		tp.setHTML('tablMark', '');
		                		tp.setHTML('markList', '');
		        			}
        		}, this);
        },
        renderGroupItem: function(){
        	var tp = this.template,
        		reportItem = this.get('reportItem');
        		
        		tp.setHTML('reportRenderItem', tp.replace('reportItem', [{
        			remove: reportItem.get('transferal') ? tp.replace('label') : ''
        		}, reportItem.toJSON()]));
        		
        		this.renderListGroup();
        		
        		tp.setHTML('tablMark', '');
        		
        		this.set('fieldid', reportItem.get('fieldid'));
        		this.set('groupid', reportItem.get('id'));
        		
        		this.pagination.showPagination();
        },
        renderListGroup: function(){
        	var tp = this.template,
    			reportItem = this.get('reportItem'),
    			oldGroups = this.get('oldGroups'),
    			lst = "";
        	
	        	lst += this.setLstGroup(reportItem, true);
	        	
	        	if(oldGroups){
	        		oldGroups.each(function(group){
	        			lst += this.setLstGroup(group, false);
	        		}, this);
	        	}
	        	
	        	tp.setHTML('groupList', tp.replace('listGroups', {
	        		item: lst
	        	}));
        },
        setLstGroup: function(group, active){
        	var lst = "";
        	
	        	lst = this.template.replace('itemGroups', [{
	        			active: active ? 'active' : '',
	        			frmstudy: this.get('appInstance').determFormEdu(group.get('frmstudy'))
	        		}, group.toJSON()]);
	        	
	        	return lst;
        },
        reloadMarkList: function(){
        	var reportItem = this.get('reportItem'),
        		data = {
        			fieldid: this.get('fieldid'),
        			groupid: this.get('groupid'),
        			studid:  reportItem.get('studid'),
        			course: this.pagination.get('course'),
        			semestr: this.pagination.get('semestr')
        		};
        	
        	if(data.course && data.semestr){
        		this.set('waiting', true);
        		this.get('appInstance').markStudReport(data, function(err, result){
        			this.set('waiting', false);
        				if(!err){
        					this.set('markList', result.markStudReport);
        						this.renderMarkList();
        				}
        		}, this);
        	}
        },
        renderMarkList: function(){
        	var markList = this.get('markList'),
        		tp = this.template,
        		lst = "";
        	
        	markList.each(function(mark){
        		var markItem = mark.toJSON();
        		
        			markItem.date = Brick.dateExt.convert(markItem.date, 2);
        			markItem.summark = markItem.mark;
        			
        			if(markItem.sheetid > 0){
        				markItem.cl = markItem.mark < 51 ? "class='danger'": '';
        				markItem.mark = this.setTradMark(markItem.mark, markItem.formcontrol);
        				markItem.namesubject = this.determNameSubject(markItem.namesubject, markItem.sheetid);
        			} else {
        				markItem.mark = "-";
        				markItem.cl = "";
        			}
        			
        		lst += tp.replace('row', markItem);
        	}, this);
        	
        	if(lst){
            	tp.setHTML('tablMark', tp.replace('table', {
            		rows: lst 
            	}));
        	} else {
            	tp.setHTML('tablMark', 'Оценок нет');
        	}
        },
        setTradMark: function(mark, fctrl){
          	if(fctrl == 'Зачет'){
        		return mark < 51 ? 'Незач' : 'Зач';
        	}
          	return this.get('appInstance').setTradMark(mark);
        },
        determNameSubject: function(name, sheetid){
        	return this.template.replace('subject', {
        		sheetid: sheetid,
        		name: name
        	});
        },
        unSetActive: function(){
        	var tp = this.template,
        		div = tp.gel('listGroups.list-groups'),
        		collect = div.children,
        		len = collect.length;
        	
	        	for(var i = 0; i < len; i++){
	       			collect[i].classList.remove('active');
	        	}
        },
        showModal: function(show){
        	var tp = this.template,
        		modal = tp.gel('modal'),
        		cl = modal.classList,
        		st = modal.style;
        	
        	if(show){
        		cl.add('in');
        		st.display = 'block';
        	} else {
        		cl.remove('in');
        		st.display = 'none';
        		tp.setHTML('tablMark', '');
        		tp.setHTML('markList', '');
        	}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, reportItem, table, row, label, listGroups, itemGroups, subject'},
            reportItem: {value: null},
            markList: {value: null},
            oldGroups: {value: null},
            fieldid: {value: 0},
            groupid: {value: 0},
            findValue: {value: null}
        },
        CLICKS: {
        	changeGroup: {
        		event: function(e){
        			var targ = e.target,
        				a =  targ.getDOMNode();
        			
        			if(!a.href){
        				return;
        			}
        			
        			this.set('fieldid', targ.getData('fid'));
        			this.set('groupid', targ.getData('gid'));
        			
        			this.unSetActive();
        			a.classList.add('active');
        			
        			this.reloadMarkList();
        		}
        	},
        	showSheet: {
        		event: function(e){
        			var id = e.target.getData('sheetid'),
        				self = this;
        			
        				if(!id){
        					return;
        				}
        				
        				this.markList.set('sheetid', id);
    	        		this.markList.reloadList(function(){
		        			self.reloadMarkList();
		        		});
        		}
        	},
        	print: {
        		event: function(e){
        			var course = this.pagination.get('course'),
        				semestr = this.pagination.get('semestr'),
            			fieldid = this.get('fieldid'),
            			groupid = this.get('groupid'),
            			studid = this.get('reportItem').get('studid'),
        				url = '/recordbook/print_report/' + fieldid + "/" + groupid + "/" + studid + "/" + course + "/" + semestr;
        			
        				if(!course){
        					alert( 'Укажите курс' );
        				} else if(!semestr){
        					alert( 'Укажите семестр' );        					
        				} else {
        					this.get('appInstance').printSheet(url, 'recordbookPrintReport');
        				}
        		}
        	},
        	close: {
        		event: function(e){
        			this.showModal(false);
        		}
        	}
        }
    });
};