var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.ReportListWidget = Y.Base.create('reportListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){

        	this.paginationCourse = new NS.PaginationCourseWidget({
        		srcNode: this.template.gel('pagCourse'),
        		parent: this
        	});
        },
        destructor: function(){
            if (this.paginationCourse){
                this.paginationCourse.destroy();
            }
        },
        reqFind: function(){
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
        			var res = result.findStudReport;

        			this.set('waiting', false);
        			
	        			if(!err && res.get('id')){
	        				
	        				this.set('reportItem', res);
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
        		reportItem = this.get('reportItem');
        		
        		tp.setHTML('reportRenderItem', tp.replace('reportItem', [reportItem.toJSON()]));
        		tp.setHTML('tablMark', '');
        		
        		this.paginationCourse.showPagination();
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
        },
        reloadMarkList: function(){
        	var reportItem = this.get('reportItem'),
        		data = {
        			fieldid: reportItem.get('fieldid'),
        			groupid: reportItem.get('id'),
        			studid:  reportItem.get('studid'),
        			course: this.paginationCourse.get('filterCourse'),
        			semestr: this.paginationCourse.get('filterSemestr')
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
        		var tradMark = this.get('appInstance').setTradMark(mark.get('mark'));
        		
        		lst += tp.replace('row', [{
        			n: ++n,
        			date: Brick.dateExt.convert(mark.get('date'), 2),
        			mark: tradMark,
        			cl: tradMark === '' ? 'class="danger"' : ""
        		},mark.toJSON()]);
        	}, this);
        	
        	if(lst.length){
            	tp.setHTML('tablMark', tp.replace('table', {
            		rows: lst 
            	}));
        	} else {
            	tp.setHTML('tablMark', 'Оценок нет');
        	}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, reportItem, table, row'},
            reportItem: {value: null},
            markList: {value: null}
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
        	}
        }
    });
};