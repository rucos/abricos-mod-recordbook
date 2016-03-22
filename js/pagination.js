var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']}
    ]
};
Component.entryPoint = function(NS){

	var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.PaginationWidget = Y.Base.create('paginationWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	
        },        
    	renderPaginator: function(){
        	var tp = this.template,
	    		count = this.get('countRow'),
	    		limit = 15,
	    		countPage = Math.ceil(count / limit),
	    		page = this.get('currentPage'),
	    		lst = "",
	    		start = Math.max(1, page - 2),
	    		end = Math.min(+page + 2, countPage);
    		
	        	if(count > limit){
		        	for(var i = start; i <= end; i++){
		        		lst += tp.replace('liPagePagin', {
		        			cnt: i,
		        			active: i == page ? 'active' : ''
		        		});
		        	}
		        	tp.setHTML('pag', tp.replace('paginator', {
		        		lipage: lst,
		        		dp: page == 1 ? 'none' : '',
		        		dn: page == countPage ? 'none' : '',
		        		lastpage: countPage,
		        		firstpage: 1
		        	}));
	        	} else {
	        		tp.setHTML('pag', '');
	        	}
    	}
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, paginator, liPagePagin'},
            currentPage: {value: 1},
            countRow: {value: 0},
            parent: ''
        },
        CLICKS: {
        	changePage: {
        		event: function(e){
                	var page =  this.get('currentPage'),
	            		type = e.target.getData('type');
            	
	            	switch(type){
	            		case 'prev': page--; break;
	            		case 'next': page++; break;
	            		case 'curent': 
	            		case 'first': 
	            		case 'last': page = e.target.getData('page'); break;
	            	}
                	this.set('currentPage', page);
                	
	            	this.get('parent').reloadList();
        		}
        	}
        }
    });
    
    NS.PaginationCourseWidget = Y.Base.create('paginationCourseWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var tp = this.template,
        		show = this.get('show');
        	
        		if(show){
        			this.showPagination();
        		}
        },        
        setActive: function(collect, value){
        	for(var i = 0; i < collect.length; i++){
        		if(i == value - 1){
        			collect[i].classList.add('active');
        		} else {
        			collect[i].classList.remove('active');
        		}
        	}
        },
        showPagination: function(){
        	var tp = this.template;
        	
        	tp.setHTML('pagCourse', tp.replace('paginatorCourse'));
        },
        hidePagination: function(){
        	this.template.setHTML('pagCourse', "");
        	this.set('filterSemestr', 0);
        	this.set('filterCourse', 0);
        },
        act: function(){
        	var parent = this.get('parent');
        	
  			switch(parent.name){
				case 'reportListWidget':
					parent.reloadMarkList();
						break;
  			}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, paginatorCourse'},
            filterSemestr: {value: 0},
            filterCourse: {value: 0},
            show: {value: false},
            parent: ''
        },
        CLICKS: {
        	setFilter: {
        		event: function(e){
        			var label = e.target.getDOMNode(),
        				value = label.textContent;
        			
        			if(label.tagName == 'LABEL'){
        				switch(value){
        					case "Осенний" :
        						this.set('filterSemestr', 1);
        							value = 1;
        								break;
        					case "Весенний" : 
        						this.set('filterSemestr', 2);
        							value = 2;
        								break;
        					default:
        						this.set('filterCourse', value);
        							break;
        				}
        				this.setActive(label.parentNode.children, value);
        			} else {
        				return;
        			}
        			this.act();
        		}
        	}
        }
    });
};