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
            callback: ''
        },
        CLICKS: {
        	changePage: {
        		event: function(e){
                	var page =  this.get('currentPage'),
	            		type = e.target.getData('type'),
	            		callback = this.get('callback');
            	
	            	switch(type){
	            		case 'prev': page--; break;
	            		case 'next': page++; break;
	            		case 'curent': 
	            		case 'first': 
	            		case 'last': page = e.target.getData('page'); break;
	            	}
                	this.set('currentPage', page);
                	
                	if(callback){
                		callback(page);
                	}
                	
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
        setCourse: function(value){
        	this.set('course', value);
        	
        	this.setActive(this.getChildren('course'), value);
        },
        setSemestr: function(value){
        	this.set('semestr', value);
        	
        	this.setActive(this.getChildren('semestr'), value);
        },
        getChildren: function(bname){
        	return this.template.gel('paginatorCourse.' + bname).children;
        },
        showPagination: function(){
        	var tp = this.template,
        		course = this.get('course'),
        		semestr = this.get('semestr');
        	
	        	tp.setHTML('pagCourse', tp.replace('paginatorCourse'));
	        	
	        	if(course > 0){
	        		this.setCourse(course)
	        	}
	        	if(semestr > 0){
	        		this.setSemestr(semestr);
	        	}
	        	this.act();
        },
        hidePagination: function(){
        	this.template.setHTML('pagCourse', "");
        	this.resetPagination();
        },
        resetPagination: function(){
        	this.set('semestr', 0);
        	this.set('course', 0);
        },
        act: function(){
        	var callback = this.get('callback'),
        		filterSemestr = this.get('semestr'),
        		filterCourse = this.get('course');
        	
	        	if(callback){
	            	if(filterSemestr && filterCourse){
	            		callback();        		
	            	}
	        	}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, paginatorCourse'},
            semestr: {value: 0},
            course: {value: 0},
            show: {value: false},
            callback: ''
        },
        CLICKS: {
        	setFilter: {
        		event: function(e){
        			var label = e.target.getDOMNode(),
        				value = label.textContent;
        			
        			if(label.tagName != 'LABEL'){
        				return;
        			} 
        			
    				switch(value){
						case "Осенний" :
							this.set('semestr', 1);
								value = 1;
									break;
						case "Весенний" : 
							this.set('semestr', 2);
								value = 2;
									break;
						default:
							this.set('course', +value);
								break;
					}
    				
    				this.setActive(label.parentNode.children, value);
        				this.act();
        		}
        	}
        }
    });
};