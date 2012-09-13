<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
    <div class="repeat-dialog hide" />
        <div class='control-group'>
            <div class='control-group form-inline'>
                <div class="input-prepend">
                    <span class='add-on'>Repeat</span><select class="repeat-frequency">
                        <option value="Daily">daily</option>
                        <option value="Weekly">weekly</option>
                        <option value="Monthly">monthly</option>
                        <option value="Yearly">yearly</option>
                    </select>
                </div>
                <div class="input-prepend input-append">
                    <span class='add-on'>every</span><select class="repeat-interval">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                        <option value="17">17</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                        <option value="20">20</option>
                        <option value="21">21</option>
                        <option value="22">22</option>
                        <option value="23">23</option>
                        <option value="24">24</option>
                        <option value="25">25</option>
                        <option value="26">26</option>
                        <option value="27">27</option>
                        <option value="28">28</option>
                        <option value="29">29</option>
                        <option value="30">30</option>
                    </select><span class='add-on frequency'>days</span>
                </div>
            </div>

            <div class='control-group form-inline'>
                <div class="control-group">
                    <div class="controls">
                      <label class="radio inline">
                        <input type="radio" name="repeatOptions" value="ByDay" /> By Day
                      </label>
                      <label class="radio inline">
                        <input type="radio" name="repeatOptions" value="ByDate" /> By Date
                      </label>
                    </div>
                </div>
                <div class="input-prepend">
                    <span class='add-on'>Select Day</span><input type='text' class='repeat-start-date' />
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


