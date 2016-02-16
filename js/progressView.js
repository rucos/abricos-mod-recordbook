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
        	var tp = this.template;
        	
				tp.setValue('groupInfo.inp_'+name, value);
				tp.removeClass('groupInfo.div_'+name, 'open');
				
				this.set(name, value);
					this.reqSubjectList();
        },
        reqSubjectList: function(){
        	var group = this.get('groupItem'),
        		data = {
        			fieldid: group.get('fieldid'),
        			numcrs: this.get('course'),
        			semestr: this.get('semestr') === 'осенний' ? 1 : 2,
        			groupid: this.get('groupid'),
        			from: 'progressViewWidget'
        		};
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
        			lstTh = "",
        			lstMarkTd = "";
        		
        		subjectList.each(function(subject){
	        			lstTh += tp.replace('markSubj', [{
	        				namesubject: subject.get('namesubject')
	        			}, subject.toJSON()]);
	        			
	    	    		lstMarkTd += tp.replace('markTd', [subject.toJSON()]);
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
        	var markListStat= this.get('markListStat'),
        		tp = this.template,
        		idRow = 'rowMarkTable.stud-';
        	
        	markListStat.each(function(mark){
        		var id = idRow + mark.get('studid'),
        			row = tp.one(id).getDOMNode(),
        			tdRow = row.cells,
        			len = tdRow.length;
        		
        		for(var i = 3; i < len; i++){
        			if(tdRow[i].id == mark.get('subjectid')){
        				tdRow[i].innerHTML = this.calcMark(mark.get('mark'));
        					break;
        			}
        		}
        	}, this);
        },
        calcMark: function(val){
        	if(val <= 100){
        		if(val < 51){
        			return '';
        		} else if(val >=51 && val < 71){
        			return '3';
        		} else if(val >= 71 && val < 86){
        			return '4';
        		} else {
        			return '5';
        		}
        	} else {
        		switch(val){
        			case 101: return '';
        			case 102: return 'Зач';
        			case 103: return '3';
        			case 104: return '4';
        			case 105: return '5';
        		}
        	}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,groupInfo,markTable,markSubj,rowMarkTable,markTd'},
            groupid: {value: 0},
            groupItem: {value: null},
            course: {value: 0},
            semestr: {value: ''},
            subjectList: {value: null},
            markListStat: {value: null},
            studList: {value: null}
        },
        CLICKS: {
        	close:{
        		event: function(){
        			this.go('managerGroups.view');
        		}
        	},
        	choiceCourse: {
        		event: function(e){
        			this.renderDropdown(e.target.getData('course'), 'course');
        		}
        	},
        	choiceSemestr: {
        		event: function(e){
        			this.renderDropdown(e.target.getData('semestr'), 'semestr');
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