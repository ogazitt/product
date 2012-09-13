<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
    <div id='repeatDialog' class='hide'>
    <div>
        <div class='repeat-dialog control-group'>
            <div class='control-group form-inline'>
                <div class="input-prepend">
                    <span class='add-on'>Repeat after</span><select class="repeat-interval int-selector">
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
                        <input name="SU" type="checkbox" aria-label="Repeat on Sunday" />
                        <span>S</span>
                    </label>
                    <label class="checkbox inline" title="Monday">
                        <input name="MO" type="checkbox" aria-label="Repeat on Monday" />
                        <span>M</span>
                    </label>
                    <label class="checkbox inline" title="Tuesday">
                        <input name="TU" type="checkbox" aria-label="Repeat on Tuesday" />
                        <span>T</span>
                    </label>
                    <label class="checkbox inline" title="Wednesday">
                        <input name="WE" type="checkbox" aria-label="Repeat on Wednesday" />
                        <span>W</span>
                    </label>
                    <label class="checkbox inline" title="Thursday">
                        <input name="TH" type="checkbox" aria-label="Repeat on Thursday" />
                        <span>T</span>
                    </label>
                    <label class="checkbox inline" title="Friday">
                        <input name="FR" type="checkbox" aria-label="Repeat on Friday" />
                        <span>F</span>
                    </label>
                    <label class="checkbox inline" title="Saturday">
                        <input name="SA" type="checkbox" aria-label="Repeat on Saturday" />
                        <span>S</span>
                    </label>
                </div>
            </div>

            <div class='alert alert-success repeat-summary'></div>
        </div>
    </div>
    </div>
