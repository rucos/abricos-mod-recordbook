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

	        	this.paginationCourse = new NS.PaginationCourseWidget({
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
            if (this.paginationCourse){
                this.paginationCourse.destroy();
            }
            if(this.markList){
            	this.markList.destroy();
            }
        },
        reqFind: function(value){
        	var tp = this.template,
        		value = tp.getValue('inpfind').trim();
        	
        	if(!value){
        		alert( 'Введите ФИО студента или № зачетной книжки' );
        		
        			tp.setValue('inpfind', '');
        			tp.gel('inpfind').focus();
        			
        	} else {
        		this.paginationCourse.hidePagination();
        		tp.removeClass('btnCancel', 'hide');
        		
        		this.set('waiting', true);
        		this.get('appInstance').findStudReport(value, function(err, result){
        			var reportItem = result.findStudReport;

        			this.set('waiting', false);
	        			if(!err && reportItem.get('id')){
	        					this.set('oldGroups', result.groupList);
		        				this.set('reportItem', reportItem);
		        					this.renderGroupItem();
	        			} else {
	        				this.cancel(false);
	        				tp.setHTML('reportRenderItem', 'Студент не найден');
	        			}
        		}, this);
        	}
        },
        renderGroupItem: function(){
        	var tp = this.template,
        		reportItem = this.get('reportItem'),
        		lstGroup = tp.replace('listGroups', {
        			item: this.renderListGroup()
        		});
        		
        		tp.setHTML('reportRenderItem', tp.replace('reportItem', [{
        			remove: reportItem.get('transferal') ? tp.replace('label') : '',
        			data: lstGroup
        		}, reportItem.toJSON()]));
        		
        		tp.setHTML('tablMark', '');
        		
        		this.set('fieldid', reportItem.get('fieldid'));
        		this.set('groupid', reportItem.get('id'));
        		
        		this.paginationCourse.showPagination();
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
	        	return lst;
        },
        setLstGroup: function(group, active){
        	var tp = this.template,
        		lst = "";
        	
	        	lst = tp.replace('itemGroups', [{
	        			active: active ? 'active' : ''
	        		}, group.toJSON()]);
	        	
	        	return lst;
        },
        reloadMarkList: function(){
        	var reportItem = this.get('reportItem'),
        		data = {
        			fieldid: this.get('fieldid'),
        			groupid: this.get('groupid'),
        			studid:  reportItem.get('studid'),
        			course: this.paginationCourse.get('course'),
        			semestr: this.paginationCourse.get('semestr')
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
        		lst = "",
        		n = 0;
        	
        	markList.each(function(mark){
        		var markItem = mark.toJSON();
        		
        		lst += tp.replace('row', [{
        			n: ++n,
        			date: Brick.dateExt.convert(markItem.date, 2),
        			mark: this.get('appInstance').setTradMark(markItem.mark),
        			cl: markItem.mark < 51 || markItem.mark == 101 ? 'class="danger"' : "",
        			formcontrol: markItem.type >= 3 ? this.determFormControl(markItem.project) : markItem.formcontrol,
        			namesubject: this.determNameSubject(markItem.namesubject, markItem.sheetid)
        		}, markItem]);
        	}, this);
        	
        	if(lst.length){
            	tp.setHTML('tablMark', tp.replace('table', {
            		rows: lst 
            	}));
        	} else {
            	tp.setHTML('tablMark', 'Оценок нет');
        	}
        },
        determNameSubject: function(name, sheetid){
        	return this.template.replace('subject', {
        		sheetid: sheetid,
        		name: name
        	});
        },
        determFormControl: function(project){
        	return project.indexOf('1') > 0 ? 'Курсовой проект' : 'Курсовая работа';
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
        cancel: function(flag){
			var tp = this.template;
			
			if(flag){
				tp.addClass('btnCancel', 'hide');
				tp.setHTML('reportRenderItem', '');
				tp.setValue('inpfind', '');
			}
			
			tp.setHTML('tablMark', '');
			this.paginationCourse.hidePagination();
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, reportItem, table, row, label, listGroups, itemGroups, subject'},
            reportItem: {value: null},
            markList: {value: null},
            oldGroups: {value: null},
            fieldid: {value: 0},
            groupid: {value: 0}
        },
        CLICKS: {
        	find: {
        		event: function(e){
        			this.reqFind();
        		}
        	},
        	cancel: {
        		event: function(e){
        			this.cancel(true);
        		}
        	},
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
        	}
        }
    });
};