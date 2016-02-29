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
                	var page =  0,
	            		type = e.target.getData('type');
            	
	            	switch(type){
	            		case 'prev': page = this.get('currentPage'); this.set('currentPage', --page); break;
	            		case 'next': page = this.get('currentPage'); this.set('currentPage', ++page); break;
	            		case 'curent': 
	            		case 'first': 
	            		case 'last': page = e.target.getData('page'); this.set('currentPage', page); break;
	            	}
	            	this.get('parent').reloadList();
        		}
        	}
        }
    });
};