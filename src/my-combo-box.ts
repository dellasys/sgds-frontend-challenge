import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import "./components/my-badge";
import { MyDropdown } from "./components/my-dropdown";
import "./components/my-dropdown-item";
import { MyDropdownItem } from "./components/my-dropdown-item";
import styles from "./my-combo-box.scss";

type FilterFunction = (inputValue: string, menuItem: string) => boolean;

@customElement("my-combo-box")
export class MyComboBox extends MyDropdown {
  static styles = [MyDropdown.styles, styles];

  @query("#user-input") userInputElement: HTMLInputElement;

  /**The input's placeholder text. */
  @property({ type: String, reflect: true }) placeholder = "placeholder";

  /**The input's value attribute. */
  @property({ reflect: true, type: String }) value = "";

  /**The list of items to display in the dropdown. */
  @property({ type: Array }) menuList: string[] = [];

  /**The function used to determine if a menu item should be shown in the menu list, given the user's input value. */
  @property()
  filterMenu: FilterFunction = (inputValue: string, menuItem: string) => {
    const itemLowerCase = menuItem.toLowerCase();
    const valueLower = inputValue.toLowerCase();

    return itemLowerCase.startsWith(valueLower);
  };

  @state()
  filteredMenuList: string[] = [];
  selectedMenuItems: string[] = [];

  private _handleInputChange(e: CustomEvent) {
    this.showMenu();
    this.value = (e.target as HTMLInputElement).value;
    this.filteredMenuList = this.menuList.filter((item) =>
      this.filterMenu(this.value, item)
    );
  }

  private _handleSelectChange(e: KeyboardEvent | MouseEvent) {
    this.value = (e.target as MyDropdownItem).innerText;
    this._handleSelectSlot(e);
    this.selectedMenuItems = [...this.selectedMenuItems, this.value];
    this.value = "";
  }

  /** When clicked on any part of div-looking input, the embedded input is focus.  */
  private _handleToggleUserInput(e: CustomEvent) {
    e.stopPropagation();
    this._onClickDropdownToggle();
    this.userInputElement.focus();
  }

  private _handleRemoveItem = (menuItem: string) => {
    const itemIndex = this.selectedMenuItems.indexOf(menuItem);

    this.selectedMenuItems.splice(itemIndex, 1);
    this.requestUpdate();
  };

  render() {
    this.filteredMenuList = this.menuList.filter((item) => {
      if (this.selectedMenuItems.includes(item)) {
        return false;
      }

      return this.filterMenu(this.value, item);
    });

    return html`
      <div class="combobox dropdown multiselect">
        <div
          @click=${this._handleToggleUserInput}
          ${ref(this.myDropdown)}
          class="form-control"
        >
          ${this.selectedMenuItems.map((menuItem) => {
            return html`<my-badge
              .handleRemove=${this._handleRemoveItem}
              .menuItem=${menuItem}
              >${menuItem}</my-badge
            >`;
          })}
          <input
            id="user-input"
            class="form-control-multiselect"
            type="text"
            @input=${this._handleInputChange}
            @keydown=${this._handleKeyDown}
            placeholder=${this.placeholder}
            .value=${this.value}
            autocomplete="off"
          />
          <my-dropdown-icon></my-dropdown-icon>
        </div>

        <ul class="dropdown-menu" part="menu">
          ${this.filteredMenuList.length > 0
            ? this.filteredMenuList.map(
                (item) =>
                  html`<my-dropdown-item
                    href="javascript:void(0)"
                    @click=${this._handleSelectChange}
                    >${item}</my-dropdown-item
                  >`
              )
            : html`<em>No results found</em>`}
        </ul>
      </div>
    `;
  }
}

export default MyComboBox;
