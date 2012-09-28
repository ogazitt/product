<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
    <div id='repeatDialog' class='hide'>
    <div>
        <div class='repeat-dialog control-group'>
            <div class='control-group form-inline'>
                <div class="input-prepend">
                    <span class='add-on'>Repeat every</span><select class="repeat-interval int-selector">
                    </select>
                </div>
                <div class="input-prepend">
                    <select class="repeat-frequency">
                        <option value="Daily">days</option>
                        <option value="Weekly">weeks</option>
                        <option value="Monthly">months</option>
                        <option value="Yearly">years</option>
                    </select>
                </div>

                <button class="btn btn-warning pull-right">Disable</button>
            </div>

            <div class='repeat-bymonth control-group form-inline'>
                <div class="input-prepend inline" >
                    <span class='add-on'>Day of Month</span><select class='int-selector'></select>
                </div>
            </div>

            <div class='repeat-byyear control-group form-inline'>
                <div class="control-group" >
                    <div class="input-prepend" >
                        <span class='add-on'>Month of Year</span><select class='month-selector'></select>
                    </div>
                </div>
                <div class="control-group" >
                    <div class="input-prepend" >
                        <span class='add-on'>Day of Month</span><select class='int-selector'></select>
                    </div>
                </div>
            </div>

            <div class='repeat-weekdays control-group form-inline'>
                <div class="controls">
                    <label class="checkbox inline" title="Sunday">
                        <input name="0" type="checkbox" aria-label="Repeat on Sunday" />
                        <span>S</span>
                    </label>
                    <label class="checkbox inline" title="Monday">
                        <input name="1" type="checkbox" aria-label="Repeat on Monday" />
                        <span>M</span>
                    </label>
                    <label class="checkbox inline" title="Tuesday">
                        <input name="2" type="checkbox" aria-label="Repeat on Tuesday" />
                        <span>T</span>
                    </label>
                    <label class="checkbox inline" title="Wednesday">
                        <input name="3" type="checkbox" aria-label="Repeat on Wednesday" />
                        <span>W</span>
                    </label>
                    <label class="checkbox inline" title="Thursday">
                        <input name="4" type="checkbox" aria-label="Repeat on Thursday" />
                        <span>T</span>
                    </label>
                    <label class="checkbox inline" title="Friday">
                        <input name="5" type="checkbox" aria-label="Repeat on Friday" />
                        <span>F</span>
                    </label>
                    <label class="checkbox inline" title="Saturday">
                        <input name="6" type="checkbox" aria-label="Repeat on Saturday" />
                        <span>S</span>
                    </label>
                </div>
            </div>

            <div class='alert alert-success repeat-summary'></div>
        </div>
    </div>
    </div>
